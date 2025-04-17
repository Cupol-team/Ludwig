import {io} from 'socket.io-client';

const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
    withCredentials: true, // Добавляем поддержку credentials
    extraHeaders: {
        "Access-Control-Allow-Origin": "http://localhost:3000"
    }
}

const socket = io('http://localhost:3000', options); // Передаем options в конструктор

export default socket;