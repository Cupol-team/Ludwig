const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { version, validate } = require('uuid');
const path = require('path');

// Импортируем ACTIONS напрямую, так как в Node.js нет динамического импорта ES модулей
const ACTIONS = {
  JOIN: 'join',
  LEAVE: 'leave',
  SHARE_ROOMS: 'share-rooms',
  ADD_PEER: 'add-peer',
  REMOVE_PEER: 'remove-peer',
  RELAY_SDP: 'relay-sdp',
  RELAY_ICE: 'relay-ice',
  ICE_CANDIDATE: 'ice-candidate',
  SESSION_DESCRIPTION: 'session-description',
  GET_ROOMS: 'get_rooms',
  CREATE_ROOM: 'create_room'
};

// Создаём Express-приложение и HTTP-сервер
const app = express();
const server = http.createServer(app);

// Настройка CORS для express
app.use(
  cors({
    origin: "*", // В Docker будем использовать более гибкую настройку
    credentials: true,
  })
);

// Настройка Socket.IO с опциями CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"],
  },
});

// --- Обработка комнат ---
// Используем Map для метаданных комнат (если потребуется)
const roomsMeta = new Map();
// Для новых комнат (например, созданных через CREATE_ROOM) используем массив
let rooms = [];

// Функция для рассылки актуального списка комнат для клиентов, принадлежащих к проекту
function shareRoomsInfo(projectUuid) {
  for (const [socketId, socket] of io.sockets.sockets) {
    if (socket.project_uuid && socket.project_uuid === projectUuid) {
      const projectRooms = rooms.filter(room => room.project_uuid === projectUuid);
      socket.emit(ACTIONS.SHARE_ROOMS, { rooms: projectRooms });
    }
  }
}

// --- Обработка подключений Socket.IO ---
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Если project_uuid уже был установлен, рассылаем информацию о комнатах
  if (socket.project_uuid) {
    shareRoomsInfo(socket.project_uuid);
  }

  // Обработка запроса списка комнат (GET_ROOMS)
  socket.on(ACTIONS.GET_ROOMS, ({ projectUuid }) => {
    console.log(`GET_ROOMS event received for project ${projectUuid}`);
    // Сохраняем project_uuid на уровне сокета
    socket.project_uuid = projectUuid;
    const projectRooms = rooms.filter(room => room.project_uuid === projectUuid);
    socket.emit(ACTIONS.SHARE_ROOMS, { rooms: projectRooms });
  });

  // Обработка создания новой комнаты (CREATE_ROOM)
  socket.on(ACTIONS.CREATE_ROOM, ({ roomId, roomName, projectUuid }) => {
    console.log(`CREATE_ROOM event: ${roomId}, ${roomName}, project ${projectUuid}`);
    // Создаём новую комнату и добавляем её в список с использованием поля project_uuid
    const newRoom = { roomId, name: roomName, project_uuid: projectUuid };
    rooms.push(newRoom);
    console.log('rooms:', rooms);
    // Рассылаем всем клиентам данного проекта обновлённый список комнат
    io.emit(ACTIONS.SHARE_ROOMS, { rooms: rooms.filter(room => room.project_uuid === projectUuid) });
  });

  // --- Дополнительная логика для звонков (JOIN, LEAVE, RELAY_SDP, RELAY_ICE и т.п.) ---
  socket.on(ACTIONS.JOIN, (config) => {
    const { room: roomID, name, project_uuid } = config;

    // Если project_uuid ещё не установлен для сокета, сохраняем его
    if (!socket.project_uuid) {
      socket.project_uuid = project_uuid;
    }

    // Если комнаты с таким ID ещё нет, создаём её метаданные
    if (!roomsMeta.has(roomID)) {
      roomsMeta.set(roomID, { name, project_uuid });
    } else {
      // Если комната уже существует, проверяем соответствие проекта
      const meta = roomsMeta.get(roomID);
      if (meta.project_uuid !== project_uuid) {
        console.warn(`Room ${roomID} belongs to a different project.`);
        return;
      }
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);
    // Небольшая задержка для инициализации соединения
    clients.forEach(clientID => {
      setTimeout(() => {
        io.to(clientID).emit(ACTIONS.ADD_PEER, {
          peerID: socket.id,
          createOffer: false,
        });
        socket.emit(ACTIONS.ADD_PEER, {
          peerID: clientID,
          createOffer: true,
        });
      }, 500);
    });

    socket.join(roomID);
    shareRoomsInfo(project_uuid);
  });

  // Функция для выхода из комнаты (LEAVE)
  function leaveRoom() {
    const { rooms: socketRooms } = socket;
    console.log('User disconnecting from rooms:', socket.id);
    Array.from(socketRooms)
      .filter(roomID => validate(roomID) && version(roomID) === 4)
      .forEach(roomID => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);
        clients.forEach(clientID => {
          io.to(clientID).emit(ACTIONS.REMOVE_PEER, { peerID: socket.id });
          socket.emit(ACTIONS.REMOVE_PEER, { peerID: clientID });
        });
        socket.leave(roomID);
        // Если в комнате больше нет клиентов, удаляем метаданные
        const room = io.sockets.adapter.rooms.get(roomID);
        if (!room || room.size === 0) {
          roomsMeta.delete(roomID);
        }
      });
    shareRoomsInfo(socket.project_uuid);
  }
  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on('disconnecting', leaveRoom);

  // Передача сигналов для установления P2P соединения (SDP, ICE)
  socket.on(ACTIONS.RELAY_SDP, ({ peerID, sessionDescription }) => {
    io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerID: socket.id,
      sessionDescription,
    });
  });
  socket.on(ACTIONS.RELAY_ICE, ({ peerID, iceCandidate }) => {
    io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
      peerID: socket.id,
      iceCandidate,
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server is running on http://localhost:${PORT}`);
}); 