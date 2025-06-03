-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS db_poi_v1;
USE db_poi_v1;

-- Tabla de Usuarios
CREATE TABLE users (
    id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    status ENUM('online', 'offline', 'busy') DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Equipos
CREATE TABLE teams (
    id VARCHAR(15) PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    owner_id VARCHAR(10) NOT NULL,
    image VARCHAR(255),
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Membresías en Equipos
CREATE TABLE team_members (
    team_id VARCHAR(15),
    user_id VARCHAR(10),
    role ENUM('admin', 'member') DEFAULT 'member',
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Canales dentro de Equipos
CREATE TABLE team_channels (
    id VARCHAR(15) PRIMARY KEY,
    team_id VARCHAR(15) NOT NULL,
    channel_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Tabla de Chats Privados
CREATE TABLE private_chats (
    id VARCHAR(15) PRIMARY KEY,
    user1_id VARCHAR(10) NOT NULL,
    user2_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Mensajes
CREATE TABLE messages (
    id VARCHAR(15) PRIMARY KEY,
    sender_id VARCHAR(10) NOT NULL,
    chat_id VARCHAR(15),
    team_channel_id VARCHAR(15),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chat_id) REFERENCES private_chats(id) ON DELETE CASCADE,
    FOREIGN KEY (team_channel_id) REFERENCES team_channels(id) ON DELETE CASCADE
);

-- Tabla de Tareas dentro de Equipos
CREATE TABLE tasks (
    id VARCHAR(15) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,                     
    description TEXT,                                 
    team_id VARCHAR(15) NOT NULL,                     
    creator_id VARCHAR(10) NOT NULL,                  
    due_date TIMESTAMP NULL,                         
    has_reward BOOLEAN DEFAULT FALSE,                 
    notify_by_email BOOLEAN DEFAULT FALSE,            
    status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending', -- Task status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
); 

-- Tabla para saber quién subió tarea
CREATE TABLE task_submissions (
    id VARCHAR(15) PRIMARY KEY,
    task_id VARCHAR(15) NOT NULL,
    user_id VARCHAR(10) NOT NULL,                     -- Usuario que completó la tarea
    multimedia_id VARCHAR(15) NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,                                       
    UNIQUE (task_id, user_id),                        -- Asegurarse que el usuario sólo puedar subirlo 1 vez
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (multimedia_id) REFERENCES multimedia(id) ON DELETE SET NULL
);


-- Tabla de Archivos Multimedia
CREATE TABLE multimedia (
    id VARCHAR(15) PRIMARY KEY,
    message_id VARCHAR(15),
    task_id VARCHAR(15),
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    original_filename VARCHAR(255) NULL,
    bytes INT NULL,
    public_id VARCHAR(255) NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);


-- Tabla de Mensajes Fijados
CREATE TABLE pinned_teams (
    user_id VARCHAR(10),
    team_id VARCHAR(15),
    PRIMARY KEY (user_id, team_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Tabla de Videollamadas
CREATE TABLE video_calls (
    id VARCHAR(15) PRIMARY KEY,
    caller_id VARCHAR(10) NOT NULL,
    receiver_id VARCHAR(10), -- Null en llamadas grupales
    team_id VARCHAR(15), -- NULL si la llamada es 1 a 1
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    status ENUM('active', 'ended', 'missed') NOT NULL DEFAULT 'active',
    FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Tabla de Usuarios en Llamada
CREATE TABLE video_call_participants (
    id VARCHAR(15) PRIMARY KEY,
    video_call_id VARCHAR(15) NOT NULL,
    user_id VARCHAR(10) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    FOREIGN KEY (video_call_id) REFERENCES video_calls(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Recompensas
CREATE TABLE rewards (
    id VARCHAR(15) PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    descrip TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- SELECT * FROM private_chats
-- SELECT * FROM messages
-- ALTER TABLE users CHANGE COLUMN password_hash password VARCHAR(255) NOT NULL;
-- INSERT INTO users (id, username, email, password, avatar, status);
-- 
-- INSERT INTO messages (id, sender_id, chat_id, team_channel_id, content, created_at) VALUES ('8867566ed6ec51', 'VeckThor15', NULL, 3, 'ola grupo', '2025-05-20 06:11:03.211')

-- CONSULTAS
INSERT INTO users (id, username, email, password, avatar) VALUES ('VEK15', 'Veck MR', 'victormolru15@gmail.com', 'password123', 'default_avatar.png');
