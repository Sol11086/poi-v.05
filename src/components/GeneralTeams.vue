<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import Chat from "@/components/chat.vue";
import 'primeicons/primeicons.css'
import socket from "@/utils/socket.js";
import { parseJwt } from '@/utils/jwt.js';
import { InputText } from "primevue";
import { content, header } from "@primeuix/themes/aura/accordion";

const canalActivo = ref(1)
function toggleCanal(canal) {
    canalActivo.value = canal
}

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
        <div class="grid bg-[#071922] h-full w-1/3 p-4">
            <div class="grid h-6/12">
                <div class="flex items-center gap-4">
                    <Button icon="pi pi-arrow-left" variant="text" size="small" @click="$emit('backToTeamsList')" rounded
                    class="text-gray-500 hover:bg-[#173c4e]" />
                    <div class="text-gray-500 items-center"> Canales de chat </div>
                </div>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2" @click="toggleCanal(1)"># Canal 1</Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2" @click="toggleCanal(2)"># Canal 2</Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2" @click="toggleCanal(3)"># Canal 3</Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2" @click="toggleCanal(4)"># Canal 4</Button>
                <Button class="hover:bg-[#173c4e] text-gray-300 h-fit p-2" @click="toggleCanal(5)"># Canal 5</Button>

            </div>
        </div>

        <div v-if="canalActivo === 1" class="w-2/3">
            <div class="h-10/12">
                <div class="h-1/12 flex items-center text-[#9F86F9] gap-2 bg-[#071922] p-4">
                    <i class="pi pi-comment"></i>
                    <div>
                        <p class="chat-header-status">Canal 1</p>
                    </div>
                </div>
                <div class="h-full bg-[#030d11] p-4">
                    <!-- <small class="text-gray-500"> {{ user.username }}</small> -->
                    <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user === username }"
                        class="message-item">
                        <p class="message-text" :class="msg.user === username ? 'message-sent' : 'message-received'">
                            {{ msg.message }}
                        </p>
                    </div>
                </div>
                <div class="bg-[#071922] flex items-center justify-between p-4">
                    <InputText v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..."
                        class="bg-[#030d11] text-white p-2 w-full" />
                    <Button icon="pi pi-send" @click="sendMessage" severity="contrast" variant="text" rounded
                        class="hover:text-[#129E82]" />
                </div>
            </div>
        </div>
        <div v-if="canalActivo === 2" class="w-2/3">
            <div class="h-10/12">
                <div class="h-1/12 flex items-center text-[#9F86F9] gap-2 bg-[#071922] p-4">
                    <i class="pi pi-comment"></i>
                    <div>
                        <p class="chat-header-status">Canal 2</p>
                    </div>
                </div>
                <div class="h-full bg-[#030d11] p-4">
                    <!-- <small class="text-gray-500"> {{ user.username }}</small> -->
                    <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user === username }"
                        class="message-item">
                        <p class="message-text" :class="msg.user === username ? 'message-sent' : 'message-received'">
                            {{ msg.message }}
                        </p>
                    </div>
                </div>
                <div class="bg-[#071922] flex items-center justify-between p-4">
                    <InputText v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..."
                        class="bg-[#030d11] text-white p-2 w-full" />
                    <Button icon="pi pi-send" @click="sendMessage" severity="contrast" variant="text" rounded
                        class="hover:text-[#129E82]" />
                </div>
            </div>
        </div>
        <div v-if="canalActivo === 3" class="w-2/3">
            <div class="h-10/12">
                <div class="h-1/12 flex items-center text-[#9F86F9] gap-2 bg-[#071922] p-4">
                    <i class="pi pi-comment"></i>
                    <div>
                        <p class="chat-header-status">Canal 3</p>
                    </div>
                </div>
                <div class="h-full bg-[#030d11] p-4">
                    <!-- <small class="text-gray-500"> {{ user.username }}</small> -->
                    <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user === username }"
                        class="message-item">
                        <p class="message-text" :class="msg.user === username ? 'message-sent' : 'message-received'">
                            {{ msg.message }}
                        </p>
                    </div>
                </div>
                <div class="bg-[#071922] flex items-center justify-between p-4">
                    <InputText v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..."
                        class="bg-[#030d11] text-white p-2 w-full" />
                    <Button icon="pi pi-send" @click="sendMessage" severity="contrast" variant="text" rounded
                        class="hover:text-[#129E82]" />
                </div>
            </div>
        </div>
        <div v-if="canalActivo === 4" class="w-2/3">
            <div class="h-10/12">
                <div class="h-1/12 flex items-center text-[#9F86F9] gap-2 bg-[#071922] p-4">
                    <i class="pi pi-comment"></i>
                    <div>
                        <p class="chat-header-status">Canal 4</p>
                    </div>
                </div>
                <div class="h-full bg-[#030d11] p-4">
                    <!-- <small class="text-gray-500"> {{ user.username }}</small> -->
                    <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user === username }"
                        class="message-item">
                        <p class="message-text" :class="msg.user === username ? 'message-sent' : 'message-received'">
                            {{ msg.message }}
                        </p>
                    </div>
                </div>
                <div class="bg-[#071922] flex items-center justify-between p-4">
                    <InputText v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..."
                        class="bg-[#030d11] text-white p-2 w-full" />
                    <Button icon="pi pi-send" @click="sendMessage" severity="contrast" variant="text" rounded
                        class="hover:text-[#129E82]" />
                </div>
            </div>
        </div>
        <div v-if="canalActivo === 5" class="w-2/3">
            <div class="h-10/12">
                <div class="h-1/12 flex items-center text-[#9F86F9] gap-2 bg-[#071922] p-4">
                    <i class="pi pi-comment"></i>
                    <div>
                        <p class="chat-header-status">Canal 5</p>
                    </div>
                </div>
                <div class="h-full bg-[#030d11] p-4">
                    <!-- <small class="text-gray-500"> {{ user.username }}</small> -->
                    <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user === username }"
                        class="message-item">
                        <p class="message-text" :class="msg.user === username ? 'message-sent' : 'message-received'">
                            {{ msg.message }}
                        </p>
                    </div>
                </div>
                <div class="bg-[#071922] flex items-center justify-between p-4">
                    <InputText v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..."
                        class="bg-[#030d11] text-white p-2 w-full" />
                    <Button icon="pi pi-send" @click="sendMessage" severity="contrast" variant="text" rounded
                        class="hover:text-[#129E82]" />
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>
