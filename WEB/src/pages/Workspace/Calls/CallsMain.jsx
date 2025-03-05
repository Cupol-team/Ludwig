import { useState, useEffect, useRef } from 'react';
import socket from './CallsSocket/index';
import ACTIONS from './CallsSocket/actions';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { createRoomButtonStyle, joinRoomButtonStyle } from '../../../styles/HoverButtonStyles';
import HoverButton from '../../../components/HoverButton';
import { roomListItemStyle } from '../../../styles/RoomListStylie';

export default function CallsMain() {
    // Получаем projectUuid из URL
    const { projectUuid } = useParams();
    const navigate = useNavigate();
    const [rooms, updateRooms] = useState([]);
    const rootNode = useRef(null);

    useEffect(() => {
        // Обработчик получения обновлённого списка комнат от сервера
        const handleShareRooms = ({ rooms = [] } = {}) => {
            console.log("Received rooms:", rooms);
            updateRooms(rooms);
        };

        socket.on(ACTIONS.SHARE_ROOMS, handleShareRooms);
        
        // После соединения с сервером сразу запрашиваем список комнат
        if (socket.connected) {
            console.log("Socket already connected, requesting rooms");
            socket.emit(ACTIONS.GET_ROOMS, { projectUuid });
        } else {
            socket.on('connect', () => {
                console.log("Socket connected, requesting rooms");
                socket.emit(ACTIONS.GET_ROOMS, { projectUuid });
            });
        }

        return () => {
            socket.off(ACTIONS.SHARE_ROOMS, handleShareRooms);
            socket.off('connect');
        };
    }, [projectUuid]);

    // Функция для присоединения к комнате
    const handleJoinRoom = (roomId) => {
        navigate(`/room/${roomId}?projectUuid=${projectUuid}`);
    };

    // Функция для создания новой комнаты
    const handleCreateRoom = () => {
        const newRoomId = uuidv4();
        // Запрос имени комнаты у пользователя, если не ввёл, задаётся значение по умолчанию
        let roomName = prompt("Введите название комнаты", "New Room") || "New Room";
        // Отправляем событие создания комнаты на сервер, чтобы он обновил список
        socket.emit(ACTIONS.CREATE_ROOM, { roomId: newRoomId, roomName, projectUuid });
        // После эмита переходим в созданную комнату
        navigate(`/room/${newRoomId}?roomName=${encodeURIComponent(roomName)}&projectUuid=${projectUuid}`);
    };

    return (
        <div ref={rootNode}>
            <h1>Available Rooms</h1>
        <ul>
            {rooms.map((room) => (
            <li 
                key={room.id || room.roomId}
                style={roomListItemStyle}
            >
                <strong>{room.name}</strong>
                <HoverButton 
                baseStyle={joinRoomButtonStyle} 
                onClick={() => handleJoinRoom(room.id || room.roomId)}
                >
                Присоединиться
                </HoverButton>
            </li>
            ))}
        </ul>
            <HoverButton baseStyle={createRoomButtonStyle} onClick={handleCreateRoom}>
                Создать комнату
            </HoverButton>
        </div>
    );
} 