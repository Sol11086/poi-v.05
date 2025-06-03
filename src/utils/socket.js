import { io } from "socket.io-client";

const socket = io('https://fcea-2806-230-4043-c126-7dfb-b81d-b40-eef7.ngrok-free.app', {
    transports: ['websocket'], // A veces es útil forzar websocket
  });
//const socket = io("http://localhost:3000"); // Asegúrate de usar la URL correcta

export default socket;
