<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Chat from "@/components/chat.vue";
import 'primeicons/primeicons.css'
import socket from "@/utils/socket.js";
import axios from 'axios';
import { parseJwt } from '@/utils/jwt.js';
import { InputText } from "primevue";


import { content, header } from "@primeuix/themes/aura/accordion";

onMounted(() => {
    equipos.value = [
        { id: 1, nombre: "Equipo A", description: "Materia programacion web sockwtmiij", urlImagen: "https://i.pinimg.com/474x/d0/84/9e/d0849ef8583ee3d834542b5d02832bab.jpg" },
        { id: 2, nombre: "Equipo B", description: "Materia programacion web sockwtmiij", urlImagen: "https://i.pinimg.com/474x/a6/4c/23/a64c2327f410f1f91abff4db7ef4e555.jpg" },
        { id: 3, nombre: "Equipo C", description: "Materia programacion web sockwtmiij", urlImagen: "https://i.pinimg.com/474x/d0/84/9e/d0849ef8583ee3d834542b5d02832bab.jpg" },
        { id: 4, nombre: "Equipo D", description: "Materia programacion web sockwtmiij", urlImagen: "https://i.pinimg.com/474x/a6/4c/23/a64c2327f410f1f91abff4db7ef4e555.jpg" },
        { id: 5, nombre: "Equipo E", description: "Materia programacion web sockwtmiij", urlImagen: "https://i.pinimg.com/474x/d0/84/9e/d0849ef8583ee3d834542b5d02832bab.jpg" },
        { id: 6, nombre: "Equipo F", description: "Materia programacion web sockwtmiij", urlImagen: "https://i.pinimg.com/474x/a6/4c/23/a64c2327f410f1f91abff4db7ef4e555.jpg" },
    ];
});

const countries = ref([
    { user_id: 'SolEcito16', name: 'Sol', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg', type: 'private' },
    { user_id: 'JellyFish8', name: 'Jelly', avatar: 'https://i.pinimg.com/474x/27/96/cb/2796cbfdd164a96a581cc272a313548b.jpg', type: 'private' },
]);


const equipos = ref<{ nombre: string; urlImagen: string }[]>([]);
const activeCallTeamId = ref(null);
const activeChatTeamId = ref(null);
const callId = ref(false);
const showCreateTeam = ref(false);
const selectedCountries = ref();
const visibleRight = ref(false);
const microphoneOn = ref(false);
const cameraOn = ref(false);
const audioOn = ref(false);

import { jwtDecode } from 'jwt-decode';

// chat script

socket.on("connect", () => {
    console.log("Conectado al servidor con ID:", socket.id);
});


const token = localStorage.getItem('user_token');
const username = parseJwt(token).username;

const chats = ref([
    { id: 1, name: 'Juan', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { id: 2, name: 'María', avatar: 'https://i.pinimg.com/474x/27/96/cb/2796cbfdd164a96a581cc272a313548b.jpg' },
    { id: 3, name: 'Chat Global', avatar: '../src/assets/logo.png' }
]);

const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref('');

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
});

const selectChat = (chat) => {
    selectedChat.value = chat;
    messages.value = [];
    chat.unreadMessages = 0; // Resetear notificaciones
    socket.emit("loadMessages", chat.id);
};

const sendMessage = () => {
    if (newMessage.value.trim() === '') return;
    socket.emit("sendMessage", {
        room: selectedChat.value.id,//id del chat 
        message: newMessage.value,
        user: username || "Anónimo",
    });
    newMessage.value = '';
};

//Escuchar mensajes recibidos
onMounted(() => {
    const roomIds = chats.value.map(chat => chat.id); // Extrae solo los IDs de las salas
    socket.emit("joinAllRooms", roomIds);

    socket.on("receiveMessage", (message) => {
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

// -----------Variables para los inputs del formulario-----------------
let teamTitle = ref('');
let teamDescription = ref('');
let selectedMembers = ref([]); // Para el MultiSelect

// Lista de usuarios/países para el MultiSelect (esto debería venir de tu backend o estado global)
// Por ahora, un ejemplo. Necesitarás cargar tus usuarios reales aquí.
const availableUsers = ref([
    // Ejemplo de formato, asumiendo que tus usuarios tienen 'id' y 'username'
    // Deberías obtener esta lista del servidor
    // { id: 'user1_id_varchar10', username: 'Usuario Ejemplo 1', avatar: 'url_avatar_1' },
    // { id: 'user2_id_varchar10', username: 'Usuario Ejemplo 2', avatar: 'url_avatar_2' },
]);

// Simulación de carga de usuarios disponibles. En una app real, esto vendría del servidor.
onMounted(async () => {
    // Aquí deberías emitir un evento al servidor para obtener la lista de todos los usuarios
    // y popular availableUsers. Por ejemplo:
    // socket.emit('fetchAllUsers', (users) => {
    // availableUsers.value = users.map(user => ({ id: user.id, name: user.username, code: user.id, avatar: user.avatar || 'default_avatar_url' }));
    // });
    // Ejemplo estático por ahora:
    availableUsers.value = [
        { user_id: '659fec9d7e9978', user_id: 'SolEcito16', name: 'Sol', avatar_url: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg', type: 'private' },
        { user_id: 'fa5c9e8de8f7da', user_id: 'JellyFish8', name: 'Jelly', avatar_url: 'https://i.pinimg.com/474x/27/96/cb/2796cbfdd164a96a581cc272a313548b.jpg', type: 'private' },
    ];
});


function getOwnerId() {
    const token = localStorage.getItem('user_token');
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.id; // Asumiendo que el token tiene un campo 'id' para el user ID
        } catch (error) {
            console.error("Error decodificando token:", error);
            return null;
        }
    }
    return null;
};


const handleCreateTeam = async () => { // Convertir a async
    const ownerId = getOwnerId();
    // ... validaciones ...

    const teamData = {
        team_name: teamTitle.value,
        owner_id: ownerId,
        // image: ...,
        description: teamDescription.value,
        members: selectedMembers.value.map(member => member.user_id)
    };

    try {
        // Asegúrate que la URL base (ej: http://localhost:3000) sea correcta
        const response = await axios.post('http://localhost:3000/api/teams', teamData, {
            headers: {
                // Si necesitas enviar el token JWT para autenticación en el endpoint HTTP
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.data.success) {
            console.log('Equipo creado exitosamente:', response.data.team);
            showCreateTeam.value = false;
            teamTitle = ref('');
            teamDescription = ref('');
            selectedMembers = ref([]);
            // Recargar equipos o actualizar UI
        } else {
            console.error('Error al crear el equipo:', response.data.error);
            // Mostrar error al usuario
        }
    } catch (error) {
        console.error('Error en la solicitud HTTP para crear equipo:', error.response ? error.response.data : error.message);
        // Mostrar error al usuario
    }

};

// Para abrir el diálogo (ejemplo, podrías tener un botón en tu template principal)
// const openCreateTeamDialog = () => {
// showCreateTeam.value = true;
// };





</script>

<template>
    <div class="bg-[#04293C] text-[#b1a7d3] flex items-center 
        justify-between h-16 px-5 mb-4">
        <span class=" text-xl font-bold ">
            <i class="pi pi-users"></i>
            Equipos
        </span>
        <Button label="Crear nuevo equipo" size="small" @click="showCreateTeam = true" class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 
        rounded-full hover:bg-[#9F86F9] hover:text-white" />
    </div>

    <div class="grid grid-cols-3 gap-6 p-6 overflow-y-hidden">
        <div v-for="equipo in equipos" :key="equipo.id"
            class="bg-[#04293C] rounded-lg shadow-md p-4 grid justify-center">
            <img :src="equipo.urlImagen" alt="Equipo" class="team-image rounded" />
            <p class="flex justify-center items-center mt-2 font-bold text-[#9F86F9]">{{ equipo.nombre }}</p>
            <p class="flex justify-center items-center mt-2 text-gray-200">{{ equipo.description }}</p>
            <div class="justify-center flex gap-4 mt-2">
                <Button icon="pi pi-phone" severity="secondary" variant="text" rounded aria-label="Bookmark"
                    class="text-[#129E82] p-1" @click="activeCallTeamId = equipo.id"
                    v-tooltip.bottom="'Iniciar llamada'" />
                <Button icon="pi pi-comments" @click="activeChatTeamId = equipo.id" class="text-[#129E82]"
                    v-tooltip.bottom="'Abrir chat'" />
            </div>
            <Dialog :visible="activeChatTeamId === equipo.id"
                @update:visible="newValue => { if (!newValue) activeChatTeamId = null; }" maximizable class="dialogChat"
                :style="{ width: '50rem', height: '30rem', backgroundColor: '#04293C', padding: '1rem', border: 'none' }"
                :pt="{
                    content: {
                        class: 'h-[500px] overflow-y-auto'
                    }
                }">
                <template #header>
                    <span class="p-2 text-white text-xl">
                        <i class="pi pi-comments"></i>
                        Chat
                    </span>
                </template>
                <Chat></Chat>
            </Dialog>
            <Dialog :visible="activeCallTeamId === equipo.id"
                @update:visible="newValue => { if (!newValue) activeCallTeamId = null; }" modal class="w-1/4 h-fit"
                :style="{ backgroundColor: transparent }" pt:root:class="!border-0 !bg-transparent">
                <template #container="{ closeCallback }">
                    <div class="bg-[#071a24] flex rounded-full justify-between items-center p-10">
                        <span class="text-gray-500"> Comenzar llamada </span>
                        <div class="relative w-fit h-fit">
                            <Button icon="pi pi-phone" @click="callId = equipo.id"
                                class="absolute inset-0 bg-transparent animate-ping text-[#129E82] hover:bg-[#129E82] hover:text-[#071a24] rounded-full pointer-events-none" />
                            <i class="pi pi-phone text-[#129E82] text-xl z-10 relative bg-transparent p-3 rounded-full cursor-pointer"
                                @click="callId = equipo.id"></i>
                        </div>
                        <Button icon="pi pi-times" @click="activeCallTeamId = false"
                            class="bg-transparent text-[#C13030] hover:bg-[#C13030] hover:text-[#071a24] hover rounded-full " />
                    </div>
                </template>
            </Dialog>
            <Dialog :visible="callId === equipo.id" @update:visible="newValue => { if (!newValue) callId = null; }"
                class="w-11/12 h-11/12" :style="{ backgroundColor: '#04293C' }" :pt="{
                    content: {
                        class: 'p-4 h-full overflow-y-auto'
                    }
                }">
                <template #header>
                    <div class="flex justify-between items-center">
                        <div class="p-4 flex justify-between items-center">
                            <span class="text-white mr-2 font-bold">Titulo de la llamada</span>
                            <Button icon="pi pi-comment" @click="visibleRight = !visibleRight" severity="secondary"
                                variant="text" rounded aria-label="Bookmark"
                                :class="visibleRight ? 'text-[#129E82]' : 'text-[#646466]'"
                                v-tooltip.bottom="'Abrir chat grupal'" />
                            <Button icon="pi pi-microphone" severity="secondary" variant="text" rounded
                                aria-label="Bookmark" @click="microphoneOn = !microphoneOn"
                                :class="microphoneOn ? 'text-[#129E82]' : 'text-[#646466]'" />
                            <Button icon="pi pi-camera" severity="secondary" variant="text" rounded
                                aria-label="Bookmark" @click="cameraOn = !cameraOn"
                                :class="cameraOn ? 'text-[#129E82]' : 'text-[#646466]'" class="text-[#129E82]" />
                            <Button icon="pi pi-headphones" severity="secondary" variant="text" rounded
                                aria-label="Bookmark" class="text-[#129E82]" @click="audioOn = !audioOn"
                                :class="audioOn ? 'text-[#129E82]' : 'text-[#646466]'" />
                        </div>
                        <div>
                            <Button severity="secondary" @click="callId = false" label="Colgar llamada"
                                class="border-[#8a2222] border-2  text-[#8a2222] p-2 text-sm font-light hover:bg-[#8a2222] hover:text-white" />
                        </div>
                    </div>
                </template>
                <div class="flex h-full">
                    <div v-if="visibleRight" class="relative z-10 bg-[#04293C] h-full w-1/3">
                        <div class="h-10/12">
                            <div class="h-1/12 flex items-center text-[#9F86F9] gap-2 bg-[#081d27] p-4">
                                <i class="pi pi-comment"></i>
                                <div>
                                    <p class="chat-header-status">Chat grupal</p>
                                </div>
                            </div>
                            <div class="h-full bg-[#030d11] p-4">
                                <div v-for="msg in messages" :key="msg.id"
                                    :class="{ 'text-right': msg.user === username }" class="message-item">
                                    <p class="message-text"
                                        :class="msg.user === username ? 'message-sent' : 'message-received'">
                                        {{ msg.message }}
                                    </p>
                                </div>
                            </div>
                            <div class="bg-[#081d27] flex items-center justify-between p-4">
                                <InputText v-model="newMessage" @keyup.enter="sendMessage"
                                    placeholder="Escribe un mensaje..." class="bg-[#030d11] text-white p-2" />
                                <Button icon="pi pi-send" @click="sendMessage" severity="contrast" variant="text"
                                    rounded class="hover:text-[#129E82]" />
                            </div>
                        </div>
                    </div>
                    <div class="w-full h-full bg-black flex flex-col items-center justify-center gap-5">
                        <span class="text-xl"> En espera </span>
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                    </div>
                </div>
            </Dialog>
        </div>
    </div>

    <Dialog v-model:visible="showCreateTeam" modal class="w-1/3 h-fit p-2" :style="{ backgroundColor: '#04293C' }">
        <template #header>
            <span class="p-2 text-white text-xl">
                <i class="pi pi-users"></i>
                Nuevo equipo
            </span>
        </template>
        <div class="p-2">
            <span class="text-gray-300">Describe a tu equipo</span>
        </div>
        <div class="p-y-5 grid w-full mt-5 gap-8">
            <FloatLabel class="w-full">
                <InputText id="team_title" class="bg-[#081e29] p-1 text-white w-full" size="large"
                    v-model="teamTitle" />
                <label for="team_title">Titulo del equipo</label>
            </FloatLabel>
            <FloatLabel class="w-full">
                <InputText id="team_description" class="bg-[#081e29] p-1 text-white w-full" size="large"
                    v-model="teamDescription" />
                <label for="team_description">Descripción (Opcional)</label>
            </FloatLabel>
            <FloatLabel class="w-full">
                <MultiSelect v-model="selectedMembers" :options="availableUsers" optionLabel="name" display="chip"
                    class="bg-[#081e29] p-2 text-white w-full"
                    overlayClass="bg-[#081e29] text-white p-1 hover:bg-[#06141b]" placeholder="Selecciona integrantes"
                    filter>
                    <template #option="slotProps">
                        <div class="flex items-center h-1/6 p-2 text-gray-300">
                            <img :alt="slotProps.option.name"
                                :src="slotProps.option.avatar_url || 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg'"
                                :class="`flag flag-${slotProps.option.code ? slotProps.option.code.toLowerCase() : ''} mr-2 h-5 w-5 rounded-full object-cover`" />
                            <div>{{ slotProps.option.name }}</div>
                        </div>
                    </template>
                    <template #dropdownicon>
                        <i class="pi pi-users" />
                    </template>
                </MultiSelect>
            </FloatLabel>
        </div>
        <div class="gap-4 flex justify-between mt-7">
            <Button label="Crear nuevo equipo" size="small" @click="handleCreateTeam" class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2
                rounded-full hover:bg-[#9F86F9] hover:text-white" />
            <Button label="Cancelar" size="small" @click="showCreateTeam = false" class="bg-transparent text-sm text-[#C13030] border-[#C13030] border-2 p-2
                rounded-full hover:bg-[#C13030] hover:text-white" />
        </div>
    </Dialog>
</template>

<style>
/* --- Estilo del borde del checkbox cuando no está marcado --- */
.p-checkbox-box {
    border: 1px solid #6B7280 !important;
    background-color: transparent !important;
    /* Asegúrate de que el fondo sea transparente o un color específico */
    transition: background-color 0.2s ease, border-color 0.2s ease;
    /* Transición suave */
}

.p-multiselect-chip.p-chip {
    background-color: #129E82 !important;
    color: white !important;
}

.p-multiselect-chip .p-chip-remove-icon {
    color: white !important;
}

.p-multiselect-option {
    background-color: #081e29;
    color: #cbd5e0;
    transition: background-color 0.2s ease;
}

.p-multiselect-option:hover {
    background-color: #1a4d6b !important;
    color: white !important;
}


.p-multiselect-option.p-highlight:hover {
    background-color: #2c77a3 !important;
    color: white !important;
}

.p-multiselect-option .flex.items-center {
    background-color: transparent !important;
}

.dialogChat {
    background-color: #04293C;
    border-color: #39b54a;
    width: 10rem;
    height: 10rem;
    padding: 4rem;
    /* Pomona Green */
}

/*.waiting-container {
    display: flex;
    flex-direction: column;  
    align-items: center;     
    justify-content: center; 
    background-color: #000000; 
    color: white;            
    height: 100vh;           
    width: 100%;             
    text-align: center;      
}

.waiting-container i {
    font-size: 3rem;         
    margin-bottom: 1rem;     
}

.waiting-container span {
    font-size: 1.5rem;       
    font-weight: bold;       
}


.inline-flex-center {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
}


.header-dialog {
    color: #010F16
}

.dialog-header {
    color: #9F86F9;
}

.dialog-header-calls {
    padding: auto;
    margin: 0px 50px;
    color: #e8e7eb;
}

.call-container {
    bottom: 1.5rem;
    right: 1.5rem;
    background-color: #04333c;
    color: #bfc0c0;
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.call-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.custom-dialog {
    border: 2px solid #129E82 !important;
    background-color: #003b2f;
    border: 2px solid #063611;
}


.header {
    display: flex;
    background-color: #04293C;
    
    height: 4rem;
    
    width: 100%;
    padding: 0 1.25rem;
    
    justify-content: space-between;
    align-items: center;
}

.header-title {
    display: flex;
    gap: 1.25rem;
    
    font-weight: 500;
    
    font-size: 1.5rem;
    
    color: #9F86F9;
    
    align-items: center;
}

.create-team-button {
    border-radius: 9999px;
    background-color: transparent;
    color: #9F86F9;
    
    border: 1px solid #9F86F9;
    
}

.create-team-button:hover {
    background-color: #9F86F9;
    
    color: white;
}


.team-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    
    gap: 1.5rem;
    
    padding: 1.5rem;
    
}

@media (min-width: 768px) {
    .team-grid {
        grid-template-columns: repeat(3, 1fr);
        
    }
}

@media (min-width: 1024px) {
    .team-grid {
        grid-template-columns: repeat(4, 1fr);
        
    }
}

.team-card {
    background-color: #04293C;
    
    border-radius: 0.5rem;
    
    padding: 1rem;
    
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    text-align: center;
}

.team-image {
    width: 100%;
    height: 10rem;
    
    object-fit: cover;
    border-radius: 0.5rem;
    
}

.team-name {
    color: white;
    margin-top: 0.5rem;
    
}

.team-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    
    margin-top: 0.75rem;
    
}

.action-button {
    color: #129E82;
    
}

.action-button:hover {
    background-color: transparent;
    color: #044134;
    
}


.create-team-dialog {
    background-color: #1B2A1D;
    
    border: 1px solid #129E82;
    
}

.dialog-description {
    color: #B0B0B0;
    
    margin-bottom: 2rem;
   
}

.input-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    margin-bottom: 1rem;
   
}

.input-label {
    font-weight: 600;
    
    width: 6rem;
    
    color: rgb(224, 224, 227)
}

.input-field {
    flex: 1;
    border-radius: 9999px;
    background-color: rgb(224, 224, 227);
    border: none;
    color: black;
}


.multi-select {
    width: 100%;
    max-width: 20rem;
    
    background-color: rgb(227, 227, 227);
    
    border: none;
    border-radius: 9999px;
    
}

.multi-select-header {
    font-weight: 500;
    padding: 0.5rem 1rem;
    
}

.multi-select-footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
   
    border: none;
}

.multi-select-option {
    display: flex;
    align-items: center;
}

.multi-select-option img {
    width: 1.125rem;
    
    margin-right: 0.5rem;
   
}


.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
   
}

.cancel-button {
    border-radius: 9999px;
    
    border: 1px solid #E74C3C;
   
    color: #E74C3C;
 
    background-color: transparent;
}

.cancel-button-phone {
    border-radius: 9999px;
    
    border: none;
   
    color: #E74C3C;
   
    background-color: transparent;
}

.cancel-button-phone:hover {
    color: #4f140d;
}

.cancel-button:hover {
    background-color: #E74C3C;
   
    color: white;
}

.create-button {
    border-radius: 9999px;
   
}*/
</style>
