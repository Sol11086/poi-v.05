<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import 'primeicons/primeicons.css'
import socket from "@/utils/socket.js";
import { parseJwt } from '@/utils/jwt.js';

socket.on("connect", () => {
    console.log("Conectado al servidor con ID:", socket.id);
});


const token = localStorage.getItem('user_token');
const username = parseJwt(token).username;
const user_id = parseJwt(token).id;
console.log(user_id);

const chats = ref([
    { id: '659fec9d7e9978', user_id: 'SolEcito16', name: 'Sol', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg', type: 'private'},
    { id: 'fa5c9e8de8f7da', user_id: 'JellyFish8', name: 'Jelly', avatar: 'https://i.pinimg.com/474x/27/96/cb/2796cbfdd164a96a581cc272a313548b.jpg', type: 'private'},
    { id: 3, name: 'Chat Global', avatar: '../src/assets/logo.png',type:'channel'}
]);

const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref('');
const currentRoomType = ref('');
//const room = ref(""); // implementar cuando se tenga conexión con la base
const isJoined = ref(false);

// Salir de la sala - implementar cuando el usuario abandone el grupo
// const leaveRoom = (room) => {
//   socket.emit("leaveRoom", room);
// };

// Resetear estado al salir de la sala
socket.on("leftRoom", () => {
    messages.value = [];
    isJoined.value = false;
    room.value = "";
});

// Escuchar mensajes previos cuando se une a una sala
socket.on("previousMessages", (history) => {
    messages.value = history;
    console.log("mensajes recibidos", history);
});

const selectChat = (chat) => {
    selectedChat.value = chat;
    messages.value = [];
    currentRoomType.value = chat.type;
    chat.unreadMessages = 0; // Resetear notificaciones
    // Ejemplo en el cliente (Vue) para cargar mensajes
    socket.emit("loadMessages", {
        room: selectedChat.value.id,
        roomType: currentRoomType.value // 'private' o 'channel'
    });
};

const sendMessage = () => {
    if (newMessage.value.trim() === '') return;
    
    socket.emit("sendMessage", {
        room: selectedChat.value.id,//id del chat 
        message: newMessage.value,
        sender_id: user_id || "Anónimo",
        receiver_id: selectedChat.value.user_id || null,
        roomType: currentRoomType.value // 'private' o 'channel'
    });
    newMessage.value = '';
};

//Escuchar mensajes recibidos
onMounted(() => {
    const roomIds = chats.value.map(chat => chat.id); // Extrae solo los IDs de las salas
    socket.emit("joinAllRooms", roomIds);

    socket.on("receiveMessage", (message) => {
        console.log(message);
        //senderID = message.user.id;
        //senderuser= message.user.username;
        //Fecha = message.created_at;
        //Hora = message.time;
        if (selectedChat.value && selectedChat.value.id === message.room) {
            messages.value.push(message);
        } else {
            console.log(`Mensaje recibido en otra sala (${message.room}):`, message);
            const chat = chats.value.find(c => c.id === message.room);
            if (chat) chat.unreadMessages += 1; // Incrementa contador de mensajes no leídos
        }
    });
});

onUnmounted(() => {
    socket.off("receiveMessage");
});

const emit = defineEmits(['view-profile'])

function goToProfile() {
  emit('view-profile', selectedChat)
}

</script>

<template>
    <div class="chat-container">
        <div class="sidebar">
            <h2 class="sidebar-title">Contacts</h2>
            <ul class="user-list">
                <li v-for="chat in chats" :key="chat.id" @click="selectChat(chat)" class="user-item">
                    <img :src="chat.avatar" class="user-avatar" />
                    <span>{{ chat.name }}</span>
                    <span v-if="chat.unreadMessages > 0" class="unread-badge">{{ chat.unreadMessages }}</span>
                </li>
            </ul>
        </div>

        <!-- Área del chat -->
        <div class="chat-area">
            <!-- Header del chat -->
            <div v-if="selectedChat" class="chat-header">
                <img :src="selectedChat.avatar" class="chat-header-avatar"  @click="goToProfile" />
                <div>
                    <h2 class="chat-header-title">{{ selectedChat.name }}</h2>
                    <p class="chat-header-status">En línea</p>
                </div>
            </div>
            <!-- Mensajes -->
            <div class="message-container">
                <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user.username === username }"
                    class="message-item">
                    <p class="message-text" :class="msg.user.username === username ? 'message-sent' : 'message-received'">
                        {{ msg.message }}
                    </p>
                </div>
            </div>

            <!-- Input de mensaje -->
            <div class="message-input">
                <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..."
                    class="message-input-field" />
                <Button icon="pi pi-send" @click="sendMessage" severity="contrast" variant="text" rounded
                    class="send-button" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    display: flex;
    height: 100%;
}

.sidebar {
    width: 16rem;
    /* Ancho más grande */
    background-color: #2C2F38;
    /* DarkJungle */
    color: white;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.sidebar-title {
    font-size: 1.125rem;
    /* text-lg */
    font-weight: 600;
    /* font-semibold */
    margin-bottom: 1rem;
}

.user-list {
    list-style: none;
    padding: 0;

}

.user-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 0.5rem;
}

.user-item:hover {
    background-color: #2F3339;
}

.user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    margin-right: 0.75rem;
    /* gap-3 */
}

.unread-badge {
    background-color: #10B981;
    color: #D1D5DB;
    width: 2vh;
    margin: 0px 5px;
    border-radius: 50%;
    text-align: center;
}

.chat-area {
    width: 100%;
    height: 100%;
    /* 3/4 de ancho */
    display: flex;
    flex-direction: column;
}

.chat-header {
    background-color: #2F3339;
    /* gray-800 */
    color: white;
    padding: 1rem;
    display: flex;
    align-items: center;
}

.chat-header-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    margin-right: 0.75rem;
    /* gap-3 */
}

.chat-header-title {
    font-size: 1.125rem;
    /* text-lg */
    font-weight: 600;
    /* font-semibold */
}

.chat-header-status {
    font-size: 0.875rem;
    /* text-sm */
    color: #10B981;
    /* text-green-400 */
}

.message-container {
    flex: 1;
    height: 100%;
    /* max-h-96 */
    padding: 1rem;
    overflow-y: auto;
    background-color: #000000;
    /* bg-black */
}

.message-item {
    margin-bottom: 0.5rem;
    /* mb-2 */
    border-radius: 9999px;
    /* rounded-full */
}

.message-text {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
}

.message-sent {
    background-color: #129E82;
    word-break: break-word;
    white-space: pre-wrap;
    /* bg-primary-500 */
    color: white;
}

.message-received {
    background-color: #D1D5DB;
    /* bg-gray-300 */
    color: black;
}

.message-input {
    padding: 1rem;
    background-color: #2F3339;
    /* gray-800 */
    display: flex;
}

.message-input-field {
    flex: 1;
    padding: 0.5rem;
    border-radius: 9999px;
    background-color: #2A2F36;
    /* bg-gunMetal */
    border: none;
    color: white;
}

.message-input-field:hover {
    border-color: #2D3748;
    /* border-gray-800 */
}

.send-button {
    color: rgb(85, 96, 92);
    /* text-primary-500 */
}

.send-button:hover {
    background-color: transparent;
    color: #00A451;
    /* text-pomonaGreen */
}
</style>
