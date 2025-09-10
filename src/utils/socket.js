import { io } from "socket.io-client";

// const socket = io('https://0087-2806-230-4043-c126-10bf-8299-9f3a-7272.ngrok-free.app', {
//     transports: ['websocket'], // A veces es útil forzar websocket
//   });
const socket = io("http://localhost:3000"); // Asegúrate de usar la URL correcta

export default socket;
