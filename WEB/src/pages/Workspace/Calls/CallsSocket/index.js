import {io} from 'socket.io-client';

const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
    withCredentials: true, // Добавляем поддержку credentials
    extraHeaders: {
        "Access-Control-Allow-Origin": "https://cupol.xyz"
    }
}

const socket = io('wss://api.cupol.xyz', options); // Передаем options в конструктор

export default socket;