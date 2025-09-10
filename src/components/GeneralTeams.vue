<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import Chat from "@/components/chat.vue";
import 'primeicons/primeicons.css'
import socket from "@/utils/socket.js";
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
    { name: 'Contacto 1', code: 'AU', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 2', code: 'BR', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 3', code: 'CN', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 4', code: 'EG', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
]);

const canal1 = ref(false);
const canal2 = ref(false);
const canal3 = ref(false);
const canal4 = ref(false);
const canal5 = ref(false);
const canal6 = ref(false);
const equipos = ref<{ nombre: string; urlImagen: string }[]>([]);

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

</script>

<template>
    <div class="flex h-full">
        <div class=" grid bg-[#071922] h-full w-1/3 p-4">
            <div class="h-1">
                <span class="text-gray-500 h-4"> Canales de chat </span>
            </div>
            <div class="grid gap-10 h-6/12">
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2 " @click="canal1 = !canal1"> # Canal 1 </Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2 " @click="canal2 = !canal2"> # Canal 2 </Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2 " @click="canal3 = !canal3"> # Canal 3 </Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2 " @click="canal4 = !canal4"> # Canal 4 </Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2 " @click="canal5 = !canal5"> # Canal 5 </Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2 " @click="canal6 = !canal6"> # Canal 6 </Button>
            </div>
        </div>
        <div v-if="canal1" class="bg-transoarent w-2/3 p-2">
            <span class="text-[#9F86F9] text-xl"> Canal 1 </span>
        </div>
        <div v-if="canal2" class="bg-transoarent w-2/3 p-2">
            <span class="text-[#9F86F9] text-xl"> Canal 2 </span>
        </div>
        <div v-if="canal3" class="bg-transoarent w-2/3 p-2">
            <span class="text-[#9F86F9] text-xl"> Canal 3 </span>
        </div>
        <div v-if="canal4" class="bg-transoarent w-2/3 p-2">
            <span class="text-[#9F86F9] text-xl"> Canal 4 </span>
        </div>
        <div v-if="canal5" class="bg-transoarent w-2/3 p-2">
            <span class="text-[#9F86F9] text-xl"> Canal 5 </span>
        </div>
        <div v-if="canal6" class="bg-transoarent w-2/3 p-2">
            <span class="text-[#9F86F9] text-xl"> Canal 6 </span>
        </div>
    </div>
    <!-- <Dialog :visible="activeChatTeamId === equipo.id"
        @update:visible="newValue => { if (!newValue) activeChatTeamId = null; }" maximizable class="dialogChat"
        :style="{ width: '50rem', height: '30rem', backgroundColor: '#04293C', padding: '1rem', border: 'none' }" :pt="{
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
                    <Button icon="pi pi-microphone" severity="secondary" variant="text" rounded aria-label="Bookmark"
                        @click="microphoneOn = !microphoneOn"
                        :class="microphoneOn ? 'text-[#129E82]' : 'text-[#646466]'" />
                    <Button icon="pi pi-camera" severity="secondary" variant="text" rounded aria-label="Bookmark"
                        @click="cameraOn = !cameraOn" :class="cameraOn ? 'text-[#129E82]' : 'text-[#646466]'"
                        class="text-[#129E82]" />
                    <Button icon="pi pi-headphones" severity="secondary" variant="text" rounded aria-label="Bookmark"
                        class="text-[#129E82]" @click="audioOn = !audioOn"
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
                    <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user === username }"
                        class="message-item">
                        <p class="message-text" :class="msg.user === username ? 'message-sent' : 'message-received'">
                            {{ msg.message }}
                        </p>
                    </div>
                </div>
                <div class="bg-[#081d27] flex items-center justify-between p-4">
                    <InputText v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..."
                        class="bg-[#030d11] text-white p-2" />
                    <Button icon="pi pi-send" @click="sendMessage" severity="contrast" variant="text" rounded
                        class="hover:text-[#129E82]" />
                </div>
            </div>
        </div>
        <div class="w-full h-full bg-black flex flex-col items-center justify-center gap-5">
            <span class="text-xl"> En espera </span>
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
    </div>
</Dialog> -->

</template>

<style>
.p-checkbox-box {
    border: 1px solid #6B7280 !important;
    background-color: transparent !important;
    transition: background-color 0.2s ease, border-color 0.2s ease;
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
</style>
