import 'dotenv/config';
import express from "express"; // 'response' no se importa directamente así
import { createServer } from "http";
import { Server } from "socket.io";
import crypto from 'crypto';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cloudinaryPkg from 'cloudinary';

// --- MANEJADORES GLOBALES DE ERRORES (PONER AL INICIO) ---
process.on('unhandledRejection', (reason, promise) => {
    console.error('!!!! ATENCIÓN: Unhandled Rejection at:', promise, 'reason:', reason, 'Stack:', reason instanceof Error ? reason.stack : 'No stack');
    // En producción, considera terminar el proceso después de loguear, ya que el estado puede ser inconsistente.
    // process.exit(1); 
});

process.on('uncaughtException', (error) => {
    console.error('!!!! ATENCIÓN: Uncaught Exception:', error, 'Stack:', error.stack);
    // Es crítico terminar el proceso aquí en producción después de loguear.
    // process.exit(1); 
});

const app = express();

// --- Configuración CORS ---
const allowedOrigins = [
    'https://de8a-2806-230-4043-c126-7dfb-b81d-b40-eef7.ngrok-free.app', // TU FRONTEND NGROK URL
    'https://fcea-2806-230-4043-c126-7dfb-b81d-b40-eef7.ngrok-free.app', // TU BACKEND NGROK URL
    'http://localhost:5173' // Para desarrollo local
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS: Origen no permitido: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization, ngrok-skip-browser-warning, X-Requested-With",
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware to verify JWT 
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, 'tu_clave_secreta', (err, user) => {
        if (err) {
            console.error("JWT verification error:", err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

const server = createServer(app);
const io = new Server(server, {
    cors: corsOptions // Aplicar la misma configuración CORS detallada a Socket.IO
});

// ------------------ CLOUDINARY -------------------
const { config: cloudinaryConfig, uploader: cloudinaryUploader, utils: cloudinaryUtils } = cloudinaryPkg.v2;
cloudinaryConfig({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME = 'duhrxfco6',
    api_key: process.env.CLOUDINARY_API_KEY = '727753889996879',
    api_secret: process.env.CLOUDINARY_API_SECRET = 'ZFlju2cWLzqZyYZylwSTty4U0Wo',
    secure: true,
});

app.post('/api/cloudinary-signature', (req, res) => { // Mantenido sin authenticateToken según tu último código
    const timestamp = Math.round((new Date).getTime() / 1000);
    const { upload_preset, folder, tags } = req.body;
    if (!upload_preset) return res.status(400).json({ success: false, error: "Upload preset is required." });
    let params_to_sign = { timestamp, upload_preset, source: 'uw' };
    if (folder) params_to_sign.folder = folder;
    if (tags && Array.isArray(tags)) params_to_sign.tags = tags.join(',');
    try {
        const signature = cloudinaryUtils.api_sign_request(params_to_sign, process.env.CLOUDINARY_API_SECRET);
        // Logs para depuración en el backend:
        console.log("Backend CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
        console.log("Backend CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
        console.log("Backend CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? '***SECRET_SET***' : '!!!SECRET_NOT_SET!!!');

        res.json({ signature, timestamp, api_key: process.env.CLOUDINARY_API_KEY, cloud_name: process.env.CLOUDINARY_CLOUD_NAME });
    } catch (error) {
        console.error("Error generating Cloudinary signature:", error);
        if (!res.headersSent) res.status(500).json({ success: false, error: "Error generating signature" });
    }
});

// ---------- CONEXION A LA BASE DE DATOS ----------
const connection = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'db_poi_v1', port: 33065
});
connection.connect((err) => {
    if (err) { console.error('Error al conectar a la base de datos:', err.stack); return; }
    console.log('Conectado a la base de datos con ID', connection.threadId);
});

// --- FUNCIONES GENERADORAS DE ID ---
function generateUserID() { return crypto.randomBytes(5).toString('hex'); }
function generateTeamID() { return crypto.randomBytes(7).toString('hex'); }
function generateVARCHAR15ID() { return crypto.randomBytes(8).toString('hex').substring(0, 15); }

// --- RUTAS ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) {
            console.error("Error en /login query:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            if (!res.headersSent) res.status(500).send({ success: false, message: 'Error al consultar la base de datos' });
            return;
        }
        if (result.length === 0) {
            if (!res.headersSent) res.status(401).send({ success: false, message: 'Usuario no encontrado' });
            return;
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
            if (!res.headersSent) res.status(401).send({ success: false, message: 'Contraseña incorrecta' });
        }
    });
});

app.post('/api/teams', authenticateToken, async (req, res) => {
    const { team_name, owner_id, image, members, description } = req.body;
    if (!team_name || !owner_id) {
        if (!res.headersSent) return res.status(400).json({ success: false, error: "Nombre y propietario obligatorios." });
        return;
    }
    const newTeamId = generateTeamID();
    const teamImagePath = image || 'default_team_avatar.png';
    try {
        await new Promise((resolve, reject) => {
            connection.beginTransaction(async (transactionErr) => {
                if (transactionErr) return reject(transactionErr);
                try {
                    await new Promise((resQ, rejQ) => connection.query('INSERT INTO teams (id, team_name, owner_id, image, caption, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [newTeamId, team_name, owner_id, teamImagePath, description], (err) => err ? rejQ(err) : resQ(null)));

                    const memberInserts = [];
                    memberInserts.push(new Promise((resQ, rejQ) => connection.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [newTeamId, owner_id, 'admin'], (err) => err ? rejQ(err) : resQ(null))));
                    if (members && members.length > 0) {
                        members.filter(uid => uid !== owner_id).forEach(userId => {
                            memberInserts.push(new Promise((resQ, rejQ) => connection.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [newTeamId, userId, 'member'], (err) => err ? rejQ(err) : resQ(null))));
                        });
                    }
                    await Promise.all(memberInserts);

                    connection.commit(commitErr => {
                        if (commitErr) return connection.rollback(() => reject(commitErr));
                        resolve({ id: newTeamId, team_name, owner_id, image: teamImagePath, members: [owner_id, ...(members || [])] });
                    });
                } catch (queryError) {
                    console.error("Error en transacción /api/teams:", JSON.stringify(queryError, Object.getOwnPropertyNames(queryError)));
                    connection.rollback(() => reject(queryError));
                }
            });
        });
        if (!res.headersSent) res.status(201).json({ success: true, team: { id: newTeamId, team_name, owner_id, image: teamImagePath, members: [owner_id, ...(members || [])] } });
    } catch (error) {
        console.error("Error catch principal /api/teams:", JSON.stringify(error, Object.getOwnPropertyNames(error)), error.stack);
        if (!res.headersSent) res.status(500).json({ success: false, error: "Error creando equipo." });
    }
});

app.get('/api/my-teams', authenticateToken, (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        if (!res.headersSent) return res.status(400).json({ success: false, error: "User ID not found in token." });
        return;
    }
    const memberOfQuery = 'SELECT team_id FROM team_members WHERE user_id = ?';
    connection.query(memberOfQuery, [userId], (err, memberResults) => {
        if (err) {
            console.error("Error fetching user's team memberships:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            if (!res.headersSent) res.status(500).json({ success: false, error: "Error fetching user's team memberships." });
            return;
        }
        if (memberResults.length === 0) {
            if (!res.headersSent) res.status(200).json({ success: true, teams: [] });
            return;
        }
        const teamIds = memberResults.map(row => row.team_id);
        const teamsQuery = 'SELECT id, team_name, owner_id, image, caption FROM teams WHERE id IN (?)';
        connection.query(teamsQuery, [teamIds], (teamErr, teamsResults) => {
            if (teamErr) {
                console.error("Error fetching teams details:", JSON.stringify(teamErr, Object.getOwnPropertyNames(teamErr)));
                if (!res.headersSent) res.status(500).json({ success: false, error: "Error fetching teams details." });
                return;
            }
            if (!res.headersSent) res.status(200).json({ success: true, teams: teamsResults });
        });
    });
});

app.get('/api/teams/:teamId/channels', authenticateToken, (req, res) => {
    const { teamId } = req.params;
    if (!teamId) {
        if (!res.headersSent) return res.status(400).json({ success: false, error: "Team ID is required." });
        return;
    }
    const query = 'SELECT id, team_id, channel_name, created_at FROM team_channels WHERE team_id = ? ORDER BY created_at ASC';
    connection.query(query, [teamId], (err, results) => {
        if (err) {
            console.error("Error fetching channels for team:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            if (!res.headersSent) res.status(500).json({ success: false, error: "Error fetching channels." });
            return;
        }
        if (!res.headersSent) res.status(200).json({ success: true, channels: results });
    });
});

app.post('/api/teams/:teamId/channels', authenticateToken, async (req, res) => {
    const { teamId: routeTeamId } = req.params;
    const { channel_name } = req.body;
    const userId = req.user.id;

    if (!channel_name) { if (!res.headersSent) return res.status(400).json({ success: false, error: "Channel name is required." }); return; }
    if (!routeTeamId) { if (!res.headersSent) return res.status(400).json({ success: false, error: "Team ID is required in path." }); return; }

    try {
        const isAdminQuery = 'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?';
        const adminResults = await new Promise((resolve, reject) => connection.query(isAdminQuery, [routeTeamId, userId], (e, r) => e ? reject(e) : resolve(r)));

        const proceedWithChannelCreation = async () => {
            const channelResult = await ManejarTeamChannel_Promise({ team_id: routeTeamId, channel_name });
            if (channelResult.success) {
                const newChannelDetails = await new Promise((resolve, reject) => connection.query('SELECT id, team_id, channel_name, created_at FROM team_channels WHERE id = ?', [channelResult.channel_id], (e, r) => e ? reject(e) : resolve(r)));
                if (newChannelDetails.length === 0) throw new Error("Channel processed but could not retrieve details.");
                if (!res.headersSent) res.status(channelResult.created ? 201 : 200).json({ success: true, message: channelResult.created ? "Channel created." : "Channel exists.", channel: newChannelDetails[0], created: channelResult.created });
            } else {
                throw new Error(channelResult.error || "Failed to create/get channel.");
            }
        };

        if (adminResults.length === 0 || adminResults[0].role !== 'admin') {
            const ownerResults = await new Promise((resolve, reject) => connection.query('SELECT owner_id FROM teams WHERE id = ?', [routeTeamId], (e, r) => e ? reject(e) : resolve(r)));
            if (ownerResults.length === 0 || ownerResults[0].owner_id !== userId) {
                if (!res.headersSent) return res.status(403).json({ success: false, error: "User is not an admin or owner." });
                return;
            }
            await proceedWithChannelCreation();
        } else {
            await proceedWithChannelCreation();
        }
    } catch (error) {
        console.error("Error en POST /api/teams/:teamId/channels:", JSON.stringify(error, Object.getOwnPropertyNames(error)), error.stack);
        if (!res.headersSent) res.status(500).json({ success: false, error: error.message || "Server error." });
    }
});

app.get('/api/teams/:teamId/members', authenticateToken, (req, res) => {
    const { teamId } = req.params;
    const query = `SELECT tm.user_id, u.username, tm.role FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.team_id = ?`;
    connection.query(query, [teamId], (err, results) => {
        if (err) {
            console.error("Error fetching team members:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            if (!res.headersSent) res.status(500).json({ success: false, error: "Error fetching team members." });
            return;
        }
        if (!res.headersSent) res.status(200).json({ success: true, members: results });
    });
});

app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title, description, team_id, due_date, has_reward, notify_by_email } = req.body;
    const creator_id = req.user.id;
    if (!title || !team_id) {
        if (!res.headersSent) return res.status(400).json({ success: false, error: "Title and team ID are required." });
        return;
    }
    const taskId = generateVARCHAR15ID();
    const taskQuery = `INSERT INTO tasks (id, title, description, team_id, creator_id, due_date, has_reward, notify_by_email, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`;
    const values = [taskId, title, description, team_id, creator_id, due_date || null, has_reward || false, notify_by_email || false];
    connection.query(taskQuery, values, (err, result) => {
        if (err) {
            console.error("Error creating task:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            if (!res.headersSent) res.status(500).json({ success: false, error: "Failed to create task." });
            return;
        }
        if (!res.headersSent) res.status(201).json({ success: true, message: "Task created successfully.", task_id: taskId, task: { id: taskId, title, team_id, creator_id, due_date, has_reward, status: 'pending' } });
    });
});

app.get('/api/teams/:teamId/tasks', authenticateToken, (req, res) => {
    const { teamId } = req.params;
    const currentUserId = req.user.id;
    const tasksQuery = `SELECT t.*, u.username as creator_username, (SELECT COUNT(*) FROM task_submissions ts WHERE ts.task_id = t.id AND ts.user_id = ?) > 0 as completed_by_current_user FROM tasks t JOIN users u ON t.creator_id = u.id WHERE t.team_id = ? ORDER BY t.created_at DESC`;
    connection.query(tasksQuery, [currentUserId, teamId], (err, results) => {
        if (err) {
            console.error("Error fetching tasks for team:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            if (!res.headersSent) res.status(500).json({ success: false, error: "Error fetching tasks." });
            return;
        }
        const tasksWithCompletion = results.map(task => ({ ...task, is_creator: task.creator_id === currentUserId, completed_by_current_user: !!task.completed_by_current_user }));
        if (!res.headersSent) res.status(200).json({ success: true, tasks: tasksWithCompletion });
    });
});

app.delete('/api/tasks/:taskId', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;
    connection.query('SELECT creator_id FROM tasks WHERE id = ?', [taskId], (findErr, findResults) => {
        if (findErr) { if (!res.headersSent) return res.status(500).json({ success: false, error: "Error checking task ownership." }); return; }
        if (findResults.length === 0) { if (!res.headersSent) return res.status(404).json({ success: false, error: "Task not found." }); return; }
        if (findResults[0].creator_id !== userId) { if (!res.headersSent) return res.status(403).json({ success: false, error: "You are not authorized to delete this task." }); return; }
        connection.query('DELETE FROM tasks WHERE id = ?', [taskId], (deleteErr, deleteResult) => {
            if (deleteErr) { if (!res.headersSent) return res.status(500).json({ success: false, error: "Failed to delete task." }); return; }
            if (deleteResult.affectedRows === 0) { if (!res.headersSent) return res.status(404).json({ success: false, error: "Task not found or already deleted." }); return; }
            if (!res.headersSent) res.status(200).json({ success: true, message: "Task deleted successfully." });
        });
    });
});

// POST /api/tasks/:taskId/submit - Submit/complete a task (REVISADO Y MEJORADO)
app.post('/api/tasks/:taskId/submit', authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;
    const { notes, file_info } = req.body; // file_info es enviado por el cliente desde homeworks.vue

    console.log(`[POST SUBMIT /api/tasks/${taskId}/submit] User: ${userId}. Notes: "${notes}". File: ${!!file_info}`);

    try {
        await new Promise((resolve, reject) => {
            connection.beginTransaction(async (transactionErr) => {
                if (transactionErr) {
                    console.error("[POST SUBMIT TXN] Error iniciando transacción:", JSON.stringify(transactionErr, Object.getOwnPropertyNames(transactionErr)));
                    return reject(transactionErr);
                }
                console.log(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Transacción iniciada.`);

                try {
                    let multimediaIdToStore = null;

                    // 1. Si hay file_info, insertar en la tabla multimedia
                    if (file_info && file_info.url) {
                        console.log(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Procesando archivo adjunto:`, file_info.original_filename);
                        const newMultimediaId = generateVARCHAR15ID();
                        const multimediaQuery = `INSERT INTO multimedia (id, task_id, file_path, file_type, original_filename, bytes, public_id, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
                        const multimediaValues = [newMultimediaId, taskId, file_info.url, file_info.type, file_info.original_filename, file_info.bytes, file_info.public_id];

                        await new Promise((resQ, rejQ) => connection.query(multimediaQuery, multimediaValues, (err) => {
                            if (err) { console.error(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Error insertando en multimedia:`, JSON.stringify(err, Object.getOwnPropertyNames(err))); return rejQ(err); }
                            multimediaIdToStore = newMultimediaId;
                            console.log(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Archivo registrado en multimedia con ID:`, multimediaIdToStore);
                            resQ(null);
                        }));
                    }

                    // 2. Insertar en task_submissions
                    const submissionId = generateVARCHAR15ID();
                    const submissionQuery = `INSERT INTO task_submissions (id, task_id, user_id, multimedia_id, notes, submitted_at) VALUES (?, ?, ?, ?, ?, NOW())`;
                    const submissionValues = [submissionId, taskId, userId, multimediaIdToStore, notes];

                    await new Promise((resQ, rejQ) => connection.query(submissionQuery, submissionValues, (err) => {
                        if (err) { console.error(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Error insertando en task_submissions:`, JSON.stringify(err, Object.getOwnPropertyNames(err))); return rejQ(err); }
                        console.log(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Entrega registrada en task_submissions con ID:`, submissionId);
                        resQ(null);
                    }));

                    // 3. Verificar si la tarea tiene recompensa y actualizar puntos del usuario
                    const taskDetails = await new Promise((resQ, rejQ) => connection.query('SELECT has_reward FROM tasks WHERE id = ?', [taskId], (err, results) => (err ? rejQ(err) : resQ(results))));

                    if (taskDetails.length > 0 && taskDetails[0].has_reward) {
                        console.log(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Tarea tiene recompensa. Actualizando puntos para usuario ${userId}.`);
                        const updateUserPointsQuery = 'UPDATE users SET reward_points = reward_points + 1 WHERE id = ?';
                        await new Promise((resQ, rejQ) => connection.query(updateUserPointsQuery, [userId], (err) => {
                            if (err) { console.error(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Error actualizando puntos de recompensa:`, JSON.stringify(err, Object.getOwnPropertyNames(err))); return rejQ(err); } // No fallar la transacción por esto, pero loguear
                            console.log(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Puntos de recompensa actualizados para usuario ${userId}.`);
                            resQ(null);
                        }));
                    }

                    // 4. Commit de la transacción
                    connection.commit((commitErr) => {
                        if (commitErr) {
                            console.error(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Error haciendo commit:`, JSON.stringify(commitErr, Object.getOwnPropertyNames(commitErr)));
                            return connection.rollback(() => reject(commitErr));
                        }
                        console.log(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Transacción completada exitosamente.`);
                        resolve({ submission_id: submissionId, awarded_reward: taskDetails.length > 0 && taskDetails[0].has_reward });
                    });

                } catch (queryError) { // Error dentro de la lógica de la transacción
                    console.error(`[POST SUBMIT TXN /api/tasks/${taskId}/submit] Error en query dentro de transacción:`, JSON.stringify(queryError, Object.getOwnPropertyNames(queryError)), queryError.stack);
                    connection.rollback(() => reject(queryError)); // Rollback y rechazar la promesa principal
                }
            });
        })
            .then(result => {
                const message = result.awarded_reward ? "Task submitted successfully and reward point awarded!" : "Task submitted successfully.";
                console.log(`[POST SUBMIT /api/tasks/${taskId}/submit] Respuesta: ${message}`);
                if (!res.headersSent) {
                    res.status(201).json({ success: true, message: message, submission_id: result.submission_id });
                } else {
                    console.warn(`[POST SUBMIT /api/tasks/${taskId}/submit] Cabeceras ya enviadas (éxito).`);
                }
            })
            .catch(error => { // Error de la promesa de transacción (begin, commit, rollback, o queryError propagado)
                console.error(`[POST SUBMIT /api/tasks/${taskId}/submit] Error en catch principal:`, JSON.stringify(error, Object.getOwnPropertyNames(error)), error.stack);
                if (!res.headersSent) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        res.status(409).json({ success: false, error: "Task already submitted by this user." });
                    } else {
                        res.status(500).json({ success: false, error: error.message || "Failed to submit task due to server error." });
                    }
                } else {
                    console.warn(`[POST SUBMIT /api/tasks/${taskId}/submit] Cabeceras ya enviadas (error catch).`);
                }
            });

    } catch (mainError) { // Error síncrono antes de la promesa
        console.error(`[POST SUBMIT /api/tasks/${taskId}/submit] Error síncrono principal:`, JSON.stringify(mainError, Object.getOwnPropertyNames(mainError)), mainError.stack);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: "Unexpected server error during task submission." });
        } else {
            console.warn(`[POST SUBMIT /api/tasks/${taskId}/submit] Cabeceras ya enviadas (error síncrono principal).`);
        }
    }
});


app.get('/api/tasks/:taskId/submissions', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const currentUserId = req.user.id;
    console.log(`[GET /api/tasks/${taskId}/submissions] User: ${currentUserId}`);

    connection.query('SELECT creator_id FROM tasks WHERE id = ?', [taskId], (taskErr, taskResults) => {
        if (taskErr) {
            console.error(`[GET SUBMISSIONS /api/tasks/${taskId}] Error 1ra query:`, JSON.stringify(taskErr, Object.getOwnPropertyNames(taskErr)), taskErr.stack);
            if (!res.headersSent) res.status(500).json({ success: false, error: "Error verificando tarea." });
            return;
        }
        if (taskResults.length === 0) {
            if (!res.headersSent) res.status(404).json({ success: false, error: "Tarea no encontrada." });
            return;
        }
        if (taskResults[0].creator_id !== currentUserId) {
            if (!res.headersSent) res.status(403).json({ success: false, error: "No autorizado." });
            return;
        }
        const submissionsQuery = `
            SELECT ts.user_id, u.username, ts.submitted_at, ts.notes,
                   md.file_path as submission_file_url, md.original_filename as submission_filename, md.file_type as submission_file_type
            FROM task_submissions ts
            JOIN users u ON ts.user_id = u.id
            LEFT JOIN multimedia md ON ts.multimedia_id = md.id
            WHERE ts.task_id = ? ORDER BY ts.submitted_at DESC`;
        connection.query(submissionsQuery, [taskId], (err, results) => {
            if (err) {
                console.error(`[GET SUBMISSIONS /api/tasks/${taskId}] Error 2da query:`, JSON.stringify(err, Object.getOwnPropertyNames(err)), err.stack);
                if (!res.headersSent) res.status(500).json({ success: false, error: "Error obteniendo entregas." });
                return;
            }
            if (!res.headersSent) res.status(200).json({ success: true, submissions: results });
        });
    });
});

app.get('/api/manageable-teams', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const query = `SELECT t.id, t.team_name FROM teams t LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = ? WHERE t.owner_id = ? OR tm.role = 'admin' GROUP BY t.id, t.team_name ORDER BY t.team_name ASC`;
    connection.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error("Error fetching manageable teams:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            if (!res.headersSent) res.status(500).json({ success: false, error: "Error fetching teams." });
            return;
        }
        if (!res.headersSent) res.status(200).json({ success: true, teams: results });
    });
});

// --- MANEJADORES DE CANALES (PROMESAS) ---
async function ManejarTeamChannel_Promise({ team_id, channel_name }) { /* ... tu lógica ... */
    return new Promise((resolve, reject) => {
        if (!team_id || !channel_name) return reject(new Error("team_id and channel_name are required."));
        connection.query('SELECT id FROM team_channels WHERE team_id = ? AND channel_name = ?', [team_id, channel_name], (err, results) => {
            if (err) return reject(err);
            if (results.length > 0) resolve({ success: true, channel_id: results[0].id, created: false });
            else {
                const newChannelId = generateVARCHAR15ID();
                connection.query('INSERT INTO team_channels (id, team_id, channel_name) VALUES (?, ?, ?)', [newChannelId, team_id, channel_name], (insertErr) => {
                    if (insertErr) return reject(insertErr);
                    resolve({ success: true, channel_id: newChannelId, created: true });
                });
            }
        });
    });
}
function ManejarPrivateChannel_Promise({ user1_id, user2_id }) { /* ... tu lógica ... */
    return new Promise((resolve, reject) => {
        if (!user1_id || !user2_id) return reject(new Error("user1_id and user2_id are required."));
        if (user1_id === user2_id) return reject(new Error("Cannot create private chat with oneself."));
        const u1 = user1_id < user2_id ? user1_id : user2_id, u2 = user1_id < user2_id ? user2_id : user1_id;
        connection.query('SELECT id FROM private_chats WHERE (user1_id = ? AND user2_id = ?)', [u1, u2], (err, results) => {
            if (err) return reject(err);
            if (results.length > 0) resolve({ success: true, chat_id: results[0].id, created: false });
            else {
                const newChatId = generateVARCHAR15ID();
                connection.query('INSERT INTO private_chats (id, user1_id, user2_id) VALUES (?, ?, ?)', [newChatId, u1, u2], (insertErr) => {
                    if (insertErr) return reject(insertErr);
                    resolve({ success: true, chat_id: newChatId, created: true });
                });
            }
        });
    });
}

// GET /api/users/contacts - Fetch users for contact list
app.get('/api/users/contacts', authenticateToken, (req, res) => {
    const currentUserId = req.user.id;
    // Exclude current user, include necessary fields for chat sidebar and popover
    const query = 'SELECT id, username, avatar, email, status, reward_points FROM users WHERE id != ? ORDER BY username ASC';
    connection.query(query, [currentUserId], (err, results) => {
        if (err) {
            console.error("Error fetching contacts:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            return res.status(500).json({ success: false, error: "Error fetching contacts." });
        }
        res.status(200).json({ success: true, contacts: results });
    });
});

// GET /api/my-teams-and-channels - Fetch teams, their channels, and light member info
app.get('/api/my-teams-and-channels', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ success: false, error: "User ID not found." });

    try {
        const memberOfQuery = `
            SELECT t.id, t.team_name, t.owner_id, t.image, t.caption 
            FROM teams t 
            JOIN team_members tm ON t.id = tm.team_id 
            WHERE tm.user_id = ? 
            ORDER BY t.team_name ASC`;
        const teams = await new Promise((resolve, reject) => {
            connection.query(memberOfQuery, [userId], (err, results) => err ? reject(err) : resolve(results));
        });

        if (teams.length === 0) return res.status(200).json({ success: true, teams: [] });

        const teamsWithDetails = await Promise.all(teams.map(async (team) => {
            const channelsQuery = 'SELECT id, team_id, channel_name, created_at FROM team_channels WHERE team_id = ? ORDER BY channel_name ASC';
            const channels = await new Promise((resolve, reject) => {
                connection.query(channelsQuery, [team.id], (err, chResults) => err ? reject(err) : resolve(chResults));
            });
            // No need to fetch members here, Popover can fetch members on demand using existing /api/teams/:teamId/members
            return { ...team, channels, members: [] }; // Initialize members as empty
        }));
        res.status(200).json({ success: true, teams: teamsWithDetails });
    } catch (error) {
        console.error("Error in /api/my-teams-and-channels:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).json({ success: false, error: "Error fetching teams and channels." });
    }
});

// POST /api/private-chats/room - Get or create a private chat room ID
app.post('/api/private-chats/room', authenticateToken, async (req, res) => {
    const user1_id = req.user.id; // Authenticated user
    const { recipientId: user2_id } = req.body;

    if (!user2_id) {
        return res.status(400).json({ success: false, error: "Recipient ID is required." });
    }
    if (user1_id === user2_id) {
        return res.status(400).json({ success: false, error: "Cannot create chat with oneself." });
    }

    try {
        const chatResult = await ManejarPrivateChannel_Promise({ user1_id, user2_id }); // Uses existing helper
        if (chatResult.success) {
            res.status(chatResult.created ? 201 : 200).json({
                success: true,
                chat_id: chatResult.chat_id,
                created: chatResult.created,
            });
        } else {
            throw new Error(chatResult.error || "Failed to get/create private chat room.");
        }
    } catch (error) {
        console.error("Error in POST /api/private-chats/room:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).json({ success: false, error: error.message || "Server error." });
    }
});

// GET /api/users/:userId - Fetch full details for a specific user
app.get('/api/users/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT id, username, email, avatar, status, reward_points FROM users WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error(`Error fetching user ${userId}:`, JSON.stringify(err, Object.getOwnPropertyNames(err)));
            return res.status(500).json({ success: false, error: "Database error." });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, error: "User not found." });
        } if (results.length > 0) {
            res.status(200).json({ success: true, user: results[0] });
        } else {
            res.status(404).json({ success: false, error: "User not found." });
        }
        //res.status(200).json({ success: true, user: results[0] });
    });
});

//---------------------Socket.io-------------------------
io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("sendMessage", async ({ room, message, sender_id, receiver_id, team_id, channel_name, roomType, file_info }) => {
        if (!sender_id || !(message || file_info) || !roomType) {
            return socket.emit('messageError', { message: 'Faltan datos esenciales para el mensaje.' });
        }
        const messageId = generateVARCHAR15ID();
        const createdAt = new Date();
        let chatIdValue = null;
        let teamChannelIdValue = null;
        let actualRoomIdForEmit = room;

        try {
            await new Promise((resolveTx, rejectTx) => {
                connection.beginTransaction(async (transactionErr) => {
                    if (transactionErr) {
                        console.error("[SOCKET SENDMSG TXN] Error beginTransaction:", JSON.stringify(transactionErr, Object.getOwnPropertyNames(transactionErr)));
                        return rejectTx(transactionErr);
                    }
                    try {
                        if (roomType === 'private') {
                            if (!receiver_id) throw new Error('Falta destinatario para chat privado.');
                            const chatRes = await ManejarPrivateChannel_Promise({ user1_id: sender_id, user2_id: receiver_id });
                            if (!chatRes.success) throw new Error(chatRes.error || "Fallo al obtener/crear chat privado");
                            chatIdValue = chatRes.chat_id;
                            actualRoomIdForEmit = chatIdValue;
                        } else if (roomType === 'channel') {
                            if (!team_id || !channel_name) throw new Error('Faltan datos para identificar canal.');
                            const channelRes = await ManejarTeamChannel_Promise({ team_id, channel_name });
                            if (!channelRes.success) throw new Error(channelRes.error || "Fallo al obtener/crear canal de equipo");
                            teamChannelIdValue = channelRes.channel_id;
                            actualRoomIdForEmit = teamChannelIdValue;
                        } else {
                            throw new Error('Tipo de sala no válido.');
                        }

                        const msgContent = file_info ? (message || `Archivo: ${file_info.original_filename || file_info.name}`) : message;
                        const msgQuery = 'INSERT INTO messages (id, sender_id, chat_id, team_channel_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)';
                        const msgValues = [messageId, sender_id, chatIdValue, teamChannelIdValue, msgContent, createdAt];
                        await new Promise((resQ, rejQ) => connection.query(msgQuery, msgValues, (e) => e ? rejQ(e) : resQ(null)));

                        if (file_info && file_info.url) {
                            const mediaId = generateVARCHAR15ID();
                            const mediaQuery = 'INSERT INTO multimedia (id, message_id, file_path, file_type, original_filename, bytes, public_id, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                            const mediaValues = [mediaId, messageId, file_info.url, file_info.type, file_info.original_filename || file_info.name, file_info.bytes, file_info.public_id, createdAt];
                            await new Promise((resQ, rejQ) => connection.query(mediaQuery, mediaValues, (e) => e ? rejQ(e) : resQ(null)));
                        }

                        connection.commit(commitErr => {
                            if (commitErr) return connection.rollback(() => rejectTx(commitErr));
                            resolveTx(null);
                        });
                    } catch (innerError) {
                        console.error("[SOCKET SENDMSG TXN] Error en query dentro de transacción:", JSON.stringify(innerError, Object.getOwnPropertyNames(innerError)), innerError.stack);
                        connection.rollback(() => rejectTx(innerError));
                    }
                });
            });

            const userResults = await new Promise((resolve, reject) => connection.query('SELECT username FROM users WHERE id = ?', [sender_id], (err, res) => err ? reject(err) : resolve(res)));
            const username = (userResults.length === 0) ? 'Desconocido' : userResults[0].username;
            const newMessageForRoom = {
                id: messageId, user: { id: sender_id, username },
                message: file_info ? (message || `Archivo: ${file_info.original_filename || file_info.name}`) : message,
                room: actualRoomIdForEmit, roomType, created_at: createdAt,
                time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                file_info: file_info || null,
            };
            io.to(actualRoomIdForEmit).emit("receiveMessage", newMessageForRoom);
            console.log(`[SOCKET SENDMSG] Mensaje enviado a sala ${actualRoomIdForEmit}`);

        } catch (error) {
            console.error("[SOCKET SENDMSG] Error catch principal:", JSON.stringify(error, Object.getOwnPropertyNames(error)), error.stack);
            socket.emit('messageError', { message: error.message || 'Error procesando mensaje.' });
        }
    });

    socket.on("joinAllRooms", (roomIds) => {
        if (Array.isArray(roomIds)) {
            roomIds.forEach((room) => { if (room) socket.join(room); });
        } else if (typeof roomIds === 'string' && roomIds) {
            socket.join(roomIds);
        }
        console.log(`Usuario ${socket.id} intentó unirse a salas:`, roomIds);
    });

    socket.on("loadMessages", ({ room, roomType }) => {
        if (!room || !roomType) { socket.emit("previousMessages", []); return; }
        let queryMessages;
        const baseSelect = `SELECT m.id, m.content, m.created_at, m.sender_id, u.username, md.id as multimedia_id, md.file_path, md.file_type, md.original_filename, md.bytes, md.public_id FROM messages m JOIN users u ON m.sender_id = u.id LEFT JOIN multimedia md ON m.id = md.message_id`;
        if (roomType === 'private') queryMessages = `${baseSelect} WHERE m.chat_id = ? ORDER BY m.created_at ASC`;
        else if (roomType === 'channel') queryMessages = `${baseSelect} WHERE m.team_channel_id = ? ORDER BY m.created_at ASC`;
        else { socket.emit("previousMessages", []); return; }

        connection.query(queryMessages, [room], (err, results) => {
            if (err) { console.error("Error loadMessages:", JSON.stringify(err, Object.getOwnPropertyNames(err))); socket.emit("previousMessages", []); return; }
            const formattedMessages = results.map(msg => ({
                id: msg.id, user: { id: msg.sender_id, username: msg.username }, message: msg.content,
                room, roomType, created_at: msg.created_at, time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                file_info: msg.multimedia_id ? { id: msg.multimedia_id, url: msg.file_path, type: msg.file_type, name: msg.original_filename, size: msg.bytes, public_id: msg.public_id } : null
            }));
            socket.emit("previousMessages", formattedMessages);
        });
    });

    socket.on("disconnect", () => console.log("Usuario desconectado:", socket.id));
});

// --- MANEJADOR DE ERRORES GLOBAL DE EXPRESS (AL FINAL) ---
app.use((err, req, res, next) => {
    console.error("--- ERROR EXPRESS NO MANEJADO ---");
    console.error("Ruta:", req.method, req.originalUrl);
    // Evitar JSON.stringify en el error completo si puede ser circular o muy grande
    console.error("Mensaje Error:", err.message);
    console.error("Stack:", err.stack);

    if (res.headersSent) {
        console.error("Manejador de errores Express: Cabeceras ya enviadas.");
        return next(err); // Delegar al manejador por defecto de Express
    }
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor.'
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
});


server.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
