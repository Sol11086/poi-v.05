import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import crypto from 'crypto';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();

// Permitir solicitudes desde ngrok (temporalmente acepta todos para pruebas)
app.use(cors({
    origin: '*', // Cambiar a dominio estando en producción
}))

app.use(express.json()); // Para parsear JSON en el cuerpo de las solicitudes
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Permitir peticiones desde el frontend
        methods: ["GET", "POST"],
    },
});
// ---------- CONEXION A LA BASE DE DATOS ----------

// Crear una conexión con la base de datos
const connection = mysql.createConnection({
    host: 'localhost',     //host de la base de datos
    user: 'root',          // usuario de la base de datos
    password: '12345',  // contraseña
    database: 'db_poi_v1', // nombre de la base de datos
    port: 3306     // puerto donde está corriendo MySQL (por defecto 3306)
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conectado a la base de datos con ID', connection.threadId);
});

// Ejecutar consultas de ejemplo
connection.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    console.log('Resultados de la consulta:', results);
});

// Endpoint para la autenticación de usuarios
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Buscar el usuario en la base de datos
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');

        // Si no se encuentra el usuario
        if (result.length === 0) {
            return res.status(401).send({ success: false, message: 'Usuario no encontrado' });
        }

        const user = result[0];

        // Verificar contraseña
        if (user.password === password) {
            // Generar un token JWT
            const token = jwt.sign({ id: user.id, username: user.username }, 'tu_clave_secreta', { expiresIn: '1h' });

            // Imprimir el token en consola para verificar su contenido
            console.log("Token generado:", token); // Esto te permitirá ver el token completo

            // Enviar el token al frontend
            return res.status(200).send({ success: true, token });
        } else {
            return res.status(401).send({ success: false, message: 'Contraseña incorrecta' });
        }
    });
});


// connection.end(); // Cerrar la conexión a la base de datos al finalizar
//----------- FIN DE LA CONFIGURACION DE LA BASE DE DATOS ----------

const salas = {}; // Almacena mensajes por sala (temporalmente)


function generateUserID() {
    return crypto.randomBytes(5).toString('hex'); // 10 caracteres hexadecimales
}

function generateTeamID() {
    return crypto.randomBytes(7).toString('hex'); // 14 caracteres hexadecimales
}

// console.log(generateUserID()); // "a3f0c8d9e1"
// console.log(generateTeamID()); // "c7a9f8e2b1d4a7"

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

    socket.on("loadMessages", (room) => {
        // Enviar historial de mensajes de la sala si existen
        socket.emit("previousMessages", salas[room] || []);
    });

    // Abandonar sala
    const leaveAllRooms = (user, roomIDs) => {
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

//////VIDEO_LLAMADA////////

//PLEEASE SO FOR ONCE IN MY LIFE
////Let me get WHAT I WANT 
///LORD KNOWA. IT WOULD BE THE FIRST TIME

socket.on("webrtc-offer", ({ to, offer }) => {
    socket.to(to).emit("webrtc-offer", { from: socket.id, offer });
});

socket.on("webrtc-answer", ({ to, answer }) => {
    socket.to(to).emit("webrtc-answer", { from: socket.id, answer });
});

socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
    socket.to(to).emit("webrtc-ice-candidate", { from: socket.id, candidate });
});

// Opcional: notificar que un usuario está listo para llamar
socket.on("ready-for-call", ({ room }) => {
    socket.to(room).emit("user-ready", { id: socket.id });
});


/////FIN VIDEOLLAMADA///////

socket.on("webrtc-offer", ({ to, offer }) => {
    socket.to(to).emit("webrtc-offer", { from: socket.id, offer });
});

socket.on("webrtc-answer", ({ to, answer }) => {
    socket.to(to).emit("webrtc-answer", { from: socket.id, answer });
});

socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
    socket.to(to).emit("webrtc-ice-candidate", { from: socket.id, candidate });
});

// Opcional: notificar que un usuario está listo para llamar
socket.on("ready-for-call", ({ room }) => {
    socket.to(room).emit("user-ready", { id: socket.id });
});


server.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
