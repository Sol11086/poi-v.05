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
    password: '',  // contraseña
    database: 'db_poi_v1', // nombre de la base de datos
    port: 33065     // puerto donde está corriendo MySQL (por defecto 3306)
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conectado a la base de datos con ID', connection.threadId);
});

// Obtener usuarios
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

//---------------------Socket.io-------------------------
// Ya no se usará 'salas' para almacenar mensajes en memoria, se usará la BD.
// const salas = {};

// Funciones para generar IDs (similar a las existentes)
function generateUserID() {
    return crypto.randomBytes(5).toString('hex'); // 10 caracteres
}

function generateTeamID() {
    return crypto.randomBytes(7).toString('hex'); // 14 caracteres
}

function generateMessageID() {
    return crypto.randomBytes(7).toString('hex').substring(0, 15); // 15 caracteres hexadecimales
}

io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    // Escuchar mensajes, guardarlos en la BD y enviarlos a la sala
    socket.on("sendMessage", ({ room, message, sender_id, roomType }) => {
        // IMPORTANTE: El cliente debe enviar 'sender_id' (el ID del usuario de la tabla 'users')
        // y 'roomType' ('private' o 'channel')
        if (!sender_id || !message || !room || !roomType) {
            console.error("Faltan datos para guardar el mensaje:", { room, message, sender_id, roomType });
            // Podrías emitir un error al cliente aquí si lo deseas
            return;
        }

        const messageId = generateMessageID();
        const createdAt = new Date();
        
        let chatIdValue = null;
        let teamChannelIdValue = null;

        if (roomType === 'private') {
            chatIdValue = room;
        } else if (roomType === 'channel') {
            teamChannelIdValue = room;
        } else {
            console.error("Tipo de sala no válido:", roomType);
            // Emitir error al cliente
            socket.emit('messageError', { message: 'Tipo de sala no válido proporcionado.' });
            return;
        }

        const query = 'INSERT INTO messages (id, sender_id, chat_id, team_channel_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [messageId, sender_id, chatIdValue, teamChannelIdValue, message, createdAt];

        connection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error al guardar el mensaje en la BD:', err);
                // Emitir error al cliente si es necesario
                socket.emit('messageError', { message: 'Error al guardar el mensaje.' });
                return;
            }
            console.log("Mensaje guardado en la BD con ID:", messageId);

            // Para enviar el mensaje a los clientes, necesitamos el nombre de usuario.
            // Hacemos una consulta rápida para obtenerlo.
            connection.query('SELECT username FROM users WHERE id = ?', [sender_id], (errUser, userResult) => {
                if (errUser || userResult.length === 0) {
                    console.error('Error al obtener el nombre de usuario para el mensaje:', errUser);
                    // Emitir el mensaje sin nombre de usuario o con un placeholder
                    const newMessageForRoom = { id: messageId, user: { id: sender_id, username: 'Desconocido' }, message, room, roomType, time: createdAt.toLocaleTimeString() };
                    io.to(room).emit("receiveMessage", newMessageForRoom);
                    return;
                }

                const username = userResult[0].username;
                const newMessageForRoom = {
                    id: messageId, // ID del mensaje
                    user: { id: sender_id, username: username }, // Información del remitente
                    message: message, // Contenido del mensaje
                    room: room, // ID de la sala (chat_id o team_channel_id)
                    roomType: roomType, // Tipo de sala
                    created_at: createdAt, // Fecha de creación (para orden y visualización)
                    time: createdAt.toLocaleTimeString() // Solo la hora para visualización rápida si se necesita
                };
                io.to(room).emit("receiveMessage", newMessageForRoom);
            });
        });
    });

    // Unirse a una sala (o múltiples salas)
    socket.on("joinAllRooms", (roomIds) => {
        if (Array.isArray(roomIds)) {
            roomIds.forEach((room) => {
                socket.join(room);
                console.log(`Usuario ${socket.id} se unió a la sala: ${room}`);
            });
        } else if (typeof roomIds === 'string') { // Para unirse a una sola sala
            socket.join(roomIds);
            console.log(`Usuario ${socket.id} se unió a la sala: ${roomIds}`);
        }
    });

    // Cargar mensajes anteriores desde la BD
    socket.on("loadMessages", ({ room, roomType }) => {
        // IMPORTANTE: El cliente debe enviar 'roomType' ('private' o 'channel')
        if (!room || !roomType) {
            console.error("Faltan datos para cargar mensajes:", { room, roomType });
            socket.emit("previousMessages", []); // Enviar array vacío o un error
            return;
        }

        let queryMessages;
        const queryParams = [room];

        if (roomType === 'private') {
            queryMessages = `
                SELECT m.id, m.content, m.created_at, m.sender_id, u.username 
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.chat_id = ?
                ORDER BY m.created_at ASC
            `;
        } else if (roomType === 'channel') {
            queryMessages = `
                SELECT m.id, m.content, m.created_at, m.sender_id, u.username 
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.team_channel_id = ?
                ORDER BY m.created_at ASC
            `;
        } else {
            console.error("Tipo de sala no válido para cargar mensajes:", roomType);
            socket.emit("previousMessages", []);
            return;
        }
        
        connection.query(queryMessages, queryParams, (err, results) => {
            if (err) {
                console.error('Error al cargar mensajes desde la BD:', err);
                socket.emit("previousMessages", []); // Enviar array vacío en caso de error
                return;
            }
            
            const formattedMessages = results.map(msg => ({
                id: msg.id,
                user: { id: msg.sender_id, username: msg.username },
                message: msg.content,
                room: room,
                roomType: roomType,
                created_at: msg.created_at,
                time: new Date(msg.created_at).toLocaleTimeString()
            }));
            socket.emit("previousMessages", formattedMessages);
        });
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
        // Aquí podrías querer manejar la lógica de 'leaveAllRooms' si es necesario,
        // pero necesitarías saber de qué salas sacar al usuario.
    });
});

server.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});


// No cierres la conexión aquí si el servidor va a seguir corriendo
// connection.end(); 