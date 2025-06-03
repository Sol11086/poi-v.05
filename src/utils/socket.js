import { io } from "socket.io-client";

// const socket = io('http://localhost:3000', {
//     transports: ['websocket'], // A veces es útil forzar websocket
//   });
const socket = io("http://localhost:3000"); // Asegúrate de usar la URL correcta

export default socket;
