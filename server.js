import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Permitir peticiones desde el frontend
        methods: ["GET", "POST"],
    },
});

const salas = {}; // Almacena mensajes por sala (temporalmente)

io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    // Escuchar mensajes y enviarlos solo a la sala correspondiente
    socket.on("sendMessage", ({ room, message, user }) => {
        const newMessage = { user, message, room, time: new Date().toLocaleTimeString() };
        console.log("Usuario ", socket.id, " Envió: '", message, "' en sala ", room);

        if (!salas[room]) salas[room] = []; // Si la sala no existe, la crea
        salas[room].push(newMessage); // Guardar mensaje en la sala

        io.to(room).emit("receiveMessage", newMessage); // Enviar mensaje solo a la sala
    });

    // Unirse a una sala
    socket.on("joinAllRooms", (roomIds) => {
        roomIds.forEach((room) => {
            socket.join(room);
            console.log(`Usuario ${socket.id} se unió a la sala: ${room}`);
        });
    });

    socket.on("loadMessages", (room) =>{
        // Enviar historial de mensajes de la sala si existen
        socket.emit("previousMessages", salas[room] || []);
    });

    // Abandonar sala
    const leaveAllRooms = (user,roomIDs) => {
        roomIds.forEach((room) => {
            socket.leave(room);
        });
        socket.emit("leftRoom"); // Notifica al cliente que ha salido
    };

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
        //leaveAllRooms();
    });
});

server.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
