import { useState, useEffect, useRef } from 'react';
import socket from './CallsSocket/index';
import ACTIONS from './CallsSocket/actions';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import '../../../styles/CallsMain.css';

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
    const handleJoinRoom = (roomId, roomName) => {
        navigate(`/room/${roomId}?roomName=${encodeURIComponent(roomName)}&projectUuid=${projectUuid}`);
    };

    // Функция для создания новой комнаты
    const handleCreateRoom = () => {
        const newRoomId = uuidv4();
        // Запрос имени комнаты у пользователя, если не ввёл, задаётся значение по умолчанию
        let roomName = prompt("Введите название комнаты", "Новая комната") || "Новая комната";
        // Отправляем событие создания комнаты на сервер, чтобы он обновил список
        socket.emit(ACTIONS.CREATE_ROOM, { roomId: newRoomId, roomName, projectUuid });
        // После эмита переходим в созданную комнату
        navigate(`/room/${newRoomId}?roomName=${encodeURIComponent(roomName)}&projectUuid=${projectUuid}`);
    };

    // Рендер компонента
    return (
        <div className="calls-container" ref={rootNode}>
            <div className="calls-header">
                <h1 className="calls-title">Видеозвонки</h1>
            </div>
            
            {rooms.length === 0 ? (
                <div className="calls-empty-state">
                    <h3 className="calls-empty-state-title">Нет активных комнат</h3>
                    <p className="calls-empty-state-description">
                        Создайте новую комнату для видеозвонка, чтобы начать общение с участниками проекта
                    </p>
                    <button className="calls-create-button" onClick={handleCreateRoom}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Создать комнату
                    </button>
                </div>
            ) : (
                <div className="calls-rooms-list">
                    {rooms.map((room) => (
                        <div className="calls-room-card" key={room.id || room.roomId}>
                            <div className="calls-room-header">
                                <h3 className="calls-room-name">{room.name}</h3>
                            </div>
                            <div className="calls-room-body">
                                <div className="calls-room-info">
                                    <div className="calls-room-status">Активен</div>
                                </div>
                                <div className="calls-button-container">
                                    <button 
                                        className="calls-join-button"
                                        onClick={() => handleJoinRoom(room.id || room.roomId, room.name)}
                                    >
                                        Присоединиться
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 