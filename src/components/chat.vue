<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import 'primeicons/primeicons.css'
import socket from "@/utils/socket.js";
import CloudinaryUploadButton from '@/components/CloudinaryUploadButton.vue';
import ManualCldImage from '@/components/ManualCldImage.vue'; // Ajusta la ruta si es necesario
import ManualCldVideo from '@/components/ManualCldVideo.vue';
import { parseJwt } from '@/utils/jwt.js';

socket.on("connect", () => {
    console.log("Conectado al servidor con ID:", socket.id);
});

const token = localStorage.getItem('user_token');
const username = parseJwt(token).username;
const user_id = parseJwt(token).id;
console.log(user_id);

const chats = ref([
    { id: '659fec9d7e9978', user_id: 'SolEcito16', name: 'Sol', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg', type: 'private' },
    { id: 'fa5c9e8de8f7da', user_id: 'JellyFish8', name: 'Jelly', avatar: 'https://i.pinimg.com/474x/27/96/cb/2796cbfdd164a96a581cc272a313548b.jpg', type: 'private' },
]);

const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref('');
const currentRoomType = ref('');
//const room = ref(""); // implementar cuando se tenga conexión con la base
const isJoined = ref(false);

// ==========================
const cldCloudName = 'duhrxfco6';

// (Opcional) Helper para determinar el tipo de recurso de forma más limpia
const getResourceType = (fileInfo) => {
    if (!fileInfo || !fileInfo.type) return 'raw'; // 'raw' es el tipo para archivos genéricos en Cloudinary
    if (fileInfo.type.startsWith('image/')) return 'image';
    if (fileInfo.type.startsWith('video/')) return 'video';
    return 'raw';
};

const props = defineProps({
    // chatId, roomType, etc., que ya estés usando
    chatId: String, // ID del chat privado o canal
    roomType: String, // 'private' o 'channel'
});

// Recupera el preset de las variables de entorno de Vite
const chatUploadPreset = 'vue_chat_uploads';

const chatFolder = computed(() => {
    if (props.roomType === 'private') {
        return `chats/private/${selectedChat.value.id}`;
    } else if (props.roomType === 'channel') {
        return `chats/channel/${selectedChat.value.id}`;
    }
    return 'chats/unknown';
});

const handleChatFileUpload = (fileData) => {
    console.log('File uploaded for chat:', fileData);
    // Enviar un mensaje a través de Socket.IO con la información del archivo
    const messagePayload = {
        room: selectedChat.value.id, // ID de la sala de socket
        sender_id: user_id, // ID del usuario que envía
        message: `Archivo: ${fileData.original_filename}`, // Mensaje de texto opcional
        file_info: { // Información del archivo para guardar y mostrar
            url: fileData.url,
            type: fileData.file_type,
            name: fileData.original_filename,
            size: fileData.bytes,
            public_id: fileData.public_id
        },
        roomType: selectedChat.value.type,
        receiver_id: selectedChat.value.user_id,
        // team_id: (si es canal y tu backend lo necesita)
        // channel_name: (si es canal y tu backend lo necesita)
    };

    // Para chats privados, el backend usa sender_id y receiver_id para ManejarPrivateChannel_Promise
    if (selectedChat.value.type === 'private') {
        messagePayload.receiver_id = selectedChat.value.user_id; // user_id del otro en el chat privado
    }

    socket.emit('sendMessage', messagePayload);
};

const handleChatUploadError = (error) => {
    console.error("Chat upload error:", error);
    // Mostrar notificación de error al usuario
    alert(`Error uploading file: ${error.message || 'Unknown error'}`);
};
// ==========================

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
        console.log('Mensaje RECIBIDO en el cliente:', JSON.stringify(message, null, 2)); // Para ver la estructura completa
        if (message.file_info) {
            console.log('Detalles de file_info RECIBIDO:', JSON.stringify(message.file_info, null, 2));
            console.log('Tipo de recurso determinado por getResourceType:', getResourceType(message.file_info));
        }
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
                <img :src="selectedChat.avatar" class="chat-header-avatar" @click="goToProfile" />
                <div>
                    <h2 class="chat-header-title">{{ selectedChat.name }}</h2>
                    <p class="chat-header-status">En línea</p>
                </div>
            </div>
            <!-- Mensajes -->
            <div class="message-container">
                <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user.username === username }"
                    class="message-item">
                    <!-- Cloudinary Media-->
                    <div v-if="msg.file_info" class="file-message-content">
                        <p class="message-content">{{ msg.message }}</p>
                        <manual-cld-image v-if="getResourceType(msg.file_info) === 'image'" :cloudName="cldCloudName"
                            :public-id="msg.file_info.public_id" width="300" crop="limit" alt="Imagen adjunta"
                            class="uploaded-multimedia my-2" />

                        <manual-cld-video v-else-if="getResourceType(msg.file_info) === 'video'"
                            :cloudName="cldCloudName" :public-id="msg.file_info.public_id" controls width="400"
                            class="uploaded-multimedia my-2" />

                        <a v-else-if="getResourceType(msg.file_info) === 'raw' && msg.file_info.url"
                            :href="msg.file_info.url" target="_blank" rel="noopener noreferrer"
                            class="file-download-link uploaded-multimedia my-2">
                            Descargar: {{ msg.file_info.name || 'archivo adjunto' }}
                            <span v-if="msg.file_info.size">({{ (msg.file_info.size / 1024).toFixed(2) }} KB)</span>
                        </a>
                        <p v-else class="message-content italic text-gray-500">No se puede mostrar el archivo adjunto.
                        </p>
                    </div>
                    <!-- End -->
                    <p v-else class="message-text"
                        :class="msg.user.username === username ? 'message-sent' : 'message-received'">
                        {{ msg.message }}
                    </p>
                </div>
            </div>

            <!-- Input de mensaje -->
            <div class="message-input">
                <div class="p-2"> <!--Cloudinary Button-->
                    <CloudinaryUploadButton :buttonLabel="null" icon="pi pi-paperclip" :uploadPreset="chatUploadPreset"
                        :folder="chatFolder" :tags="['chat', 'private', selectedChat?.id]" source="chat"
                        :relatedId="selectedChat?.id" @upload-success="handleChatFileUpload"
                        @upload-error="handleChatUploadError" class="ml-2" />
                </div>
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
