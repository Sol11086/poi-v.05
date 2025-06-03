USE db_poi_v1;

-- Insert initial user
INSERT INTO users (id, username, email, password, avatar) 
VALUES ('VEK15', 'Veck MR', 'victormolru15@gmail.com', 'password123', 'default_avatar.png');
INSERT INTO users (id, username, email, password, avatar) 
VALUES ('aa', 'aa', 'aa@gmail.com', 'password123', 'default_avatar.png');

-- Update root user password
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '12345';
FLUSH PRIVILEGES; 