import express, { response } from "express";
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

// Obtener usuarios
connection.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    console.log('Resultados de la consulta:', results);
});

// Middleware to verify JWT 
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, 'tu_clave_secreta', (err, user) => {
        if (err) {
            console.error("JWT verification error:", err);
            return res.sendStatus(403); // invalid token
        }
        req.user = user; // Add user payload to request
        next(); // proceed to the next middleware or route handler
    });
};

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
            const token = jwt.sign({ id: user.id, username: user.username }, 'tu_clave_secreta', { expiresIn: '24h' });

            // Imprimir el token en consola para verificar su contenido
            console.log("Token generado:", token); // Esto te permitirá ver el token completo

            // Enviar el token al frontend
            return res.status(200).send({ success: true, token });
        } else {
            return res.status(401).send({ success: false, message: 'Contraseña incorrecta' });
        }
    });
});

app.post('/api/teams', async (req, res) => { // O router.post('/', ...
    const { team_name, owner_id, image, members, description } = req.body;
    console.log(req.body);

    if (!team_name || !owner_id) {
        return res.status(400).json({ success: false, error: "El nombre del equipo y el ID del propietario son obligatorios." });
    }

    try {
        // Aquí llamarías a tu lógica de creación de equipo que interactúa con la BD.
        // Esta lógica podría estar en una función en este mismo archivo o en un servicio importado.
        // Por simplicidad, la lógica de BD iría aquí o en una función llamada desde aquí.

        const newTeamId = generateTeamID(); 
        const teamImagePath = image || 'default_team_avatar.png';

        // Ejemplo simplificado (deberías usar transacciones como en el ejemplo anterior de socket):
        await new Promise((resolve, reject) => {
            connection.beginTransaction(transactionErr => {
                if (transactionErr) return reject(transactionErr);

                const teamQuery = 'INSERT INTO teams (id, team_name, owner_id, image, caption, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
                connection.query(teamQuery, [newTeamId, team_name, owner_id, teamImagePath, description], (teamInsertErr) => {
                    if (teamInsertErr) return connection.rollback(() => reject(teamInsertErr));

                    const memberInserts = [];
                    memberInserts.push(new Promise((resMember, rejMember) => { // Propietario
                        connection.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [newTeamId, owner_id, 'admin'], (err) => {
                            if (err) return rejMember(err);
                            resMember();
                        });
                    }));

                    if (members && members.length > 0) {
                        members.forEach(userId => {
                            if (userId !== owner_id) {
                                memberInserts.push(new Promise((resMember, rejMember) => {
                                    connection.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [newTeamId, userId, 'member'], (err) => {
                                        if (err) return rejMember(err);
                                        resMember();
                                    });
                                }));
                            }
                        });
                    }

                    Promise.all(memberInserts)
                        .then(() => {
                            connection.commit(commitErr => {
                                if (commitErr) return connection.rollback(() => reject(commitErr));
                                resolve({ id: newTeamId, team_name, owner_id, image: teamImagePath, members: [owner_id, ...(members || [])] });
                            });
                        })
                        .catch(memberErr => connection.rollback(() => reject(memberErr)));
                });
            });
        })
        .then(createdTeam => {
             res.status(201).json({ success: true, team: createdTeam });
        })
        .catch(error => {
            console.error("Error al crear el equipo vía API:", error);
            res.status(500).json({ success: false, error: "Error interno del servidor al crear el equipo." });
        });

    } catch (error) {
        console.error("Error en POST /api/teams:", error);
        res.status(500).json({ success: false, error: "Error del servidor." });
    }
});

app.get('/api/my-teams', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Extracted from JWT by authenticateToken middleware

    if (!userId) {
        return res.status(400).json({ success: false, error: "User ID not found in token." });
    }

    try {
        // First, get the team IDs the user is a member of
        const memberOfQuery = 'SELECT team_id FROM team_members WHERE user_id = ?';
        connection.query(memberOfQuery, [userId], (err, memberResults) => {
            if (err) {
                console.error("Error fetching user's team memberships:", err);
                return res.status(500).json({ success: false, error: "Error fetching user's team memberships." });
            }

            if (memberResults.length === 0) {
                return res.status(200).json({ success: true, teams: [] }); // User is not in any teams
            }

            const teamIds = memberResults.map(row => row.team_id);

            // Now, fetch the details of those teams
            // Ensure your teams table has all necessary fields like id, team_name, image, caption (description)
            // The 'image' field in your teams table seems to store the path/URL
            const teamsQuery = 'SELECT id, team_name, owner_id, image, caption FROM teams WHERE id IN (?)';
            connection.query(teamsQuery, [teamIds], (teamErr, teamsResults) => {
                if (teamErr) {
                    console.error("Error fetching teams details:", teamErr);
                    return res.status(500).json({ success: false, error: "Error fetching teams details." });
                }
                res.status(200).json({ success: true, teams: teamsResults });
            });
        });
    } catch (error) {
        console.error("Error in /api/my-teams:", error);
        res.status(500).json({ success: false, error: "Server error while fetching teams." });
    }
});

// GET /api/teams/:teamId/channels - Fetches all channels for a specific team
app.get('/api/teams/:teamId/channels', authenticateToken, (req, res) => {
    const { teamId } = req.params;
    if (!teamId) {
        return res.status(400).json({ success: false, error: "Team ID is required." });
    }

    const query = 'SELECT id, team_id, channel_name, created_at FROM team_channels WHERE team_id = ? ORDER BY created_at ASC';
    connection.query(query, [teamId], (err, results) => {
        if (err) {
            console.error("Error fetching channels for team:", err);
            return res.status(500).json({ success: false, error: "Error fetching channels." });
        }
        res.status(200).json({ success: true, channels: results });
    });
});

// POST /api/teams/:teamId/channels - Creates a new channel in a team (admin only)
app.post('/api/teams/:teamId/channels', authenticateToken, async (req, res) => {
    const { teamId: routeTeamId } = req.params;
    const { channel_name } = req.body;
    const userId = req.user.id;

    if (!channel_name) {
        return res.status(400).json({ success: false, error: "Channel name is required." });
    }
    if (!routeTeamId) {
        return res.status(400).json({ success: false, error: "Team ID is required in path." });
    }

    // Step 1: Verify if the user is an admin of this team
    const isAdminQuery = 'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?';
    connection.query(isAdminQuery, [routeTeamId, userId], async (adminErr, adminResults) => {
        if (adminErr) {
            console.error("Error checking admin role:", adminErr);
            return res.status(500).json({ success: false, error: "Error verifying user role." });
        }
        if (adminResults.length === 0 || adminResults[0].role !== 'admin') {
            // Also check if the user is the owner of the team as a fallback admin role
            const isOwnerQuery = 'SELECT owner_id FROM teams WHERE id = ?';
            connection.query(isOwnerQuery, [routeTeamId], async (ownerErr, ownerResults) => {
                if (ownerErr) {
                     console.error("Error checking team owner:", ownerErr);
                     return res.status(500).json({ success: false, error: "Error verifying team ownership." });
                }
                if (ownerResults.length === 0 || ownerResults[0].owner_id !== userId) {
                    return res.status(403).json({ success: false, error: "User is not an admin or owner of this team." });
                }
                 // If owner, proceed to create channel
                await proceedWithChannelCreation();
            });
        } else {
             // If admin, proceed to create channel
            await proceedWithChannelCreation();
        }
    });

    async function proceedWithChannelCreation() {
        try {
            // ManejarTeamChannel_Promise uses team_id and channel_name
            const channelResult = await ManejarTeamChannel_Promise({ team_id: routeTeamId, channel_name });
            if (channelResult.success) {
                const getChannelQuery = 'SELECT id, team_id, channel_name, created_at FROM team_channels WHERE id = ?';
                connection.query(getChannelQuery, [channelResult.channel_id], (err, newChannelDetails) => {
                    if (err || newChannelDetails.length === 0) {
                        console.error("Error fetching newly created/found channel details:", err);
                        return res.status(500).json({ success: false, error: "Channel processed but could not retrieve details." });
                    }
                    
                    // Optionally: Emit an event to team members about the new channel
                    // io.to(`team-${routeTeamId}`).emit('channelCreated', newChannelDetails[0]);
                    // (Clients would need to join `team-${routeTeamId}` rooms upon team selection)

                    res.status(channelResult.created ? 201 : 200).json({
                        success: true,
                        message: channelResult.created ? "Channel created successfully." : "Channel already exists.",
                        channel: newChannelDetails[0],
                        created: channelResult.created
                    });
                });
            } else {
                throw new Error(channelResult.error || "Failed to create/get channel.");
            }
        } catch (error) {
            console.error("Error in POST /api/teams/:teamId/channels endpoint (proceedWithChannelCreation):", error.message);
            res.status(500).json({ success: false, error: error.message || "Server error while creating channel." });
        }
    }
});

// GET /api/teams/:teamId/members - Fetches members and their roles for a team
app.get('/api/teams/:teamId/members', authenticateToken, (req, res) => {
    const { teamId } = req.params;
    const query = `
        SELECT tm.user_id, u.username, tm.role 
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = ?
    `;
    connection.query(query, [teamId], (err, results) => {
        if (err) {
            console.error("Error fetching team members:", err);
            return res.status(500).json({ success: false, error: "Error fetching team members." });
        }
        res.status(200).json({ success: true, members: results });
    });
});

// connection.end(); // Cerrar la conexión a la base de datos al finalizar
//----------- FIN DE LA CONFIGURACION DE LA BASE DE DATOS ----------
// NEW: Handler to get or create a team channel
async function ManejarTeamChannel_Promise({ team_id, channel_name }) {
    return new Promise((resolve, reject) => {
        if (!team_id || !channel_name) {
            return reject(new Error("team_id and channel_name are required for team channel."));
        }

        const findQuery = 'SELECT id FROM team_channels WHERE team_id = ? AND channel_name = ?';
        connection.query(findQuery, [team_id, channel_name], (err, results) => {
            if (err) {
                console.error("Error finding team channel:", err);
                return reject(new Error("Error finding team channel."));
            }
            if (results.length > 0) {
                resolve({ success: true, channel_id: results[0].id, created: false });
            } else {
                const newChannelId = generateMessageID();// generar 15 caracteres hexadecimales
                const insertQuery = 'INSERT INTO team_channels (id, team_id, channel_name) VALUES (?, ?, ?)';
                connection.query(insertQuery, [newChannelId, team_id, channel_name], (insertErr) => {
                    if (insertErr) {
                        console.error("Error creating team channel:", insertErr);
                        let errMsg = "Error creating team channel.";
                        if (insertErr.errno === 1452) {
                            errMsg = `Error creating team channel: Team ID ${team_id} does not exist.`;
                            console.error(errMsg);
                        }
                        return reject(new Error(errMsg));
                    }
                    console.log(`Team channel created: ${channel_name} in team ${team_id} with ID ${newChannelId}`);
                    resolve({ success: true, channel_id: newChannelId, created: true });
                });
            }
        });
    });
}

// NEW: Handler to get or create a private chat
function ManejarPrivateChannel_Promise({ user1_id, user2_id }) { // Renombrada para indicar que devuelve Promesa
    return new Promise((resolve, reject) => {
        if (!user1_id || !user2_id) {
            // Usamos reject para errores que impiden continuar
            return reject(new Error("user1_id and user2_id are required."));
        }
        if (user1_id === user2_id) {
            return reject(new Error("Cannot create a private chat with oneself."));
        }

        const u1 = user1_id < user2_id ? user1_id : user2_id;
        const u2 = user1_id < user2_id ? user2_id : user1_id;

        const findQuery = 'SELECT id FROM private_chats WHERE (user1_id = ? AND user2_id = ?)';
        connection.query(findQuery, [u1, u2], (err, results) => {
            if (err) {
                console.error("Error finding private chat:", err);
                return reject(new Error("Error finding private chat."));
            }

            if (results.length > 0) {
                // Usamos resolve para el resultado exitoso
                resolve({ success: true, chat_id: results[0].id, created: false });
            } else {
                const newChatId = generateMessageID();
                const insertQuery = 'INSERT INTO private_chats (id, user1_id, user2_id) VALUES (?, ?, ?)';
                connection.query(insertQuery, [newChatId, u1, u2], (insertErr) => {
                    if (insertErr) {
                        console.error("Error creating private chat:", insertErr);
                        let errMsg = "Error creating private chat.";
                        if (insertErr.errno === 1452) {
                            errMsg = `Error creating private chat: One or both User IDs (${u1}, ${u2}) do not exist.`;
                            console.error(errMsg);
                        }
                        return reject(new Error(errMsg));
                    }
                    console.log(`Private chat created between ${u1} and ${u2} with id ${newChatId}`);
                    resolve({ success: true, chat_id: newChatId, created: true });
                });
            }
        });
    });
}
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
    socket.on("sendMessage", async ({ room, message, sender_id, receiver_id, team_id, channel_name, roomType }) => {
        // 'room' podría ser el ID si ya se conoce, o podríamos ignorarlo y depender de los otros params.
        // Para este ejemplo, asumimos que para canales, el cliente podría enviar team_id y channel_name.
        // Para privados, sender_id (quien envía) y receiver_id (el otro participante).

        if (!sender_id || !message || !roomType) {
            console.error("Faltan datos para guardar el mensaje (sender_id, message, roomType):", { sender_id, message, roomType });
            return socket.emit('messageError', { message: 'Faltan datos esenciales para el mensaje.' });
        }

        const messageId = generateMessageID(); // O tu generateMessageID
        const createdAt = new Date();
        let chatIdValue = null;
        let teamChannelIdValue = null;
        let actualRoomIdForEmit = room; // Para saber a qué sala de socket.io emitir

        try {
            if (roomType === 'private') {
                if (!receiver_id) {
                    console.error("Falta receiver_id para chat privado");
                    return socket.emit('messageError', { message: 'Falta el destinatario para el chat privado.' });
                }
                const privateChatResponse = await ManejarPrivateChannel_Promise({ user1_id: sender_id, user2_id: receiver_id });
                if (!privateChatResponse.success) throw new Error(privateChatResponse.error || "Failed to get/create private chat");
                chatIdValue = privateChatResponse.chat_id;

            } else if (roomType === 'channel') {
                // El cliente debe enviar team_id y channel_name para canales
                // O, si 'room' ya es un channel_id validado, se podría usar directamente.
                // Asumamos que el cliente envía team_id y channel_name
                if (!team_id || !channel_name) { // O si usas 'room' como ID de canal directo, !room
                    console.error("Faltan team_id o channel_name para chat de canal");
                    return socket.emit('messageError', { message: 'Faltan datos para identificar el canal.' });
                }
                const teamChannelResponse = await ManejarTeamChannel_Promise({ team_id, channel_name });
                if (!teamChannelResponse.success) throw new Error(teamChannelResponse.error || "Failed to get/create team channel");
                teamChannelIdValue = teamChannelResponse.channel_id;

            } else {
                console.error("Tipo de sala no válido:", roomType);
                return socket.emit('messageError', { message: 'Tipo de sala no válido proporcionado.' });
            }

            // --- Lógica común para insertar el mensaje ---
            const query = 'INSERT INTO messages (id, sender_id, chat_id, team_channel_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)';
            const values = [messageId, sender_id, chatIdValue, teamChannelIdValue, message, createdAt];

            // Para usar await con connection.query, necesitas "promisificarlo"
            // Opción A: Usar una librería como mysql2/promise
            // Opción B: Envolver la llamada en new Promise (como haremos aquí para el ejemplo)
            // Opción C: Usar util.promisify de Node.js

            await new Promise((resolve, reject) => {
                connection.query(query, values, (err, result) => {
                    if (err) {
                        console.error('Error al guardar el mensaje en la BD:', err);
                        let clientErrorMsg = 'Error al guardar el mensaje.';
                        if (err.errno === 1452) { // Error de FK
                            clientErrorMsg = `Error de referencia: El remitente ('${sender_id}') o la sala ('${actualRoomIdForEmit}') no son válidos.`;
                        }
                        // No emitir aquí, dejar que el catch principal lo haga
                        return reject(new Error(clientErrorMsg)); // Rechazar la promesa
                    }
                    console.log("Mensaje guardado en la BD con ID:", messageId);
                    resolve(result);
                });
            });

            // --- Lógica común para emitir el mensaje ---
            const userResults = await new Promise((resolve, reject) => {
                connection.query('SELECT username FROM users WHERE id = ?', [sender_id], (errUser, results) => {
                    if (errUser) return reject(new Error("Error fetching username"));
                    resolve(results);
                });
            });

            const username = (userResults.length === 0) ? 'Desconocido' : userResults[0].username;
            const newMessageForRoom = {
                id: messageId,
                user: { id: sender_id, username: username },
                message: message,
                room: actualRoomIdForEmit, // Usar el ID de sala correcto
                roomType: roomType,
                created_at: createdAt,
                time: createdAt.toLocaleTimeString()
            };
            io.to(room).emit("receiveMessage", newMessageForRoom);
            console.log("se envió:",message, "a sala:", room);
        } catch (error) {
            // Este catch manejará errores de las promesas (Manejar..._Promise o las creadas para connection.query)
            console.error("Error procesando sendMessage:", error.message);
            // Asegúrate de no enviar múltiples respuestas de error al socket
            if (socket && !socket.headersSent) { // headersSent no aplica a sockets, mejor un flag o verificar si ya se emitió error
                socket.emit('messageError', { message: error.message || 'Ocurrió un error procesando el mensaje.' });
            }
        }
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
            console.log("[server] intentando leer mensajes en sala:", room);
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