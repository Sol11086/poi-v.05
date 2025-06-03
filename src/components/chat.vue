<script setup lang="ts">
import { ref, onMounted, onUnmounted , computed , watch } from "vue";
import 'primeicons/primeicons.css'
import socket from "@/utils/socket.js";
import { parseJwt } from '@/utils/jwt.js';


const remotePeerId = ref('');
const currentCall = ref(null);
const selectedTeam = computed(() => {
    return equipos.value.find(equipo => equipo.id === generalId.value);
});
const equipos = ref<{ nombre: string; urlImagen: string }[]>([]);
const generalId = ref(null);
const activeCallTeamId = ref(null);
const activeChatTeamId = ref(null);
const callId = ref(false);
const showCreateTeam = ref(false);
const selectedCountries = ref();
const visibleRight = ref(false);
const microphoneOn = ref(false);
const cameraOn = ref(false);
const audioOn = ref(false);

const localVideoRef = ref<HTMLVideoElement | null>(null);
const remoteVideoRef = ref<HTMLVideoElement | null>(null);


const token = localStorage.getItem('user_token');
const username = parseJwt(token).username;

const peer = new Peer(parseJwt(token).id)

let localStream: MediaStream;

peer.on('call', call => {
    call.answer(localStream)
    call.on('stream', remoteStream => {
        remoteVideoRef.srcObject = remoteStream
    })
})

const visibleCreateRoom = ref(false);
const visibleVideoCall = ref(false);

const startCall = async () => {
    try {
        // Obtener acceso a la cámara y micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Asignar stream local al video local
        if (localVideoRef.value) {
            localVideoRef.value.srcObject = stream;
        }

        // Hacer la llamada usando callId como remote peer ID
        if (!callId) {
            console.error("callId no está definido.");
            return;
        }

        const call = peer.call(callId, stream);

        // Escuchar el stream remoto y asignarlo al video remoto
        call.on('stream', (remoteStream) => {
            if (remoteVideoRef.value) {
                remoteVideoRef.value.srcObject = remoteStream;
            }
        });

        // Guardar stream y llamada para detener luego
        currentCall.value = call;
        localStream = stream;

    } catch (error) {
        console.error('Error al iniciar llamada:', error);
    }
};

function handleCallClick(id: number) {
    visibleVideoCall.value = true; 
    remotePeerId.value = id;
    callId.value = id;
    cameraOn.value = true;
    microphoneOn.value = true;
    startCall(id);
}

function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    if (localVideoRef.value) {
        localVideoRef.value.srcObject = null;
    }
    if (remoteVideoRef.value) {
        remoteVideoRef.value.srcObject = null;
    }

    cameraOn.value = false;
    microphoneOn.value = false;

    callId.value = null;
}

watch([cameraOn, callId], async ([cam, id]) => {
    if (cam && id !== null) {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.value) {
                localVideoRef.value.srcObject = localStream;
            }
            console.log('✅ Cámara activada');

            

        } catch (error) {
            console.error('🚫 No se pudo acceder a la cámara/micrófono:', error);
            alert('Activa los permisos de cámara y micrófono para iniciar la llamada.');
            cameraOn.value = false;
        }
    }
});


watch([callId, cameraOn], ([id, cam]) => {
    if (id === null || !cam) {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
            console.log('📴 Cámara detenida');
        }
    }
});


onUnmounted(() => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
});



///VIDEOLLAMADA////

socket.on("connect", () => {
    console.log("Conectado al servidor con ID:", socket.id);
});



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

    peer.on('open',function(id){
                console.log(id);
            })
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
            <div v-if="selectedChat" class="chat-header justify-between">
                <div class="flex">
                    <img :src="selectedChat.avatar" class="chat-header-avatar" @click="goToProfile" />
                    <div>
                        <h2 class="chat-header-title">{{ selectedChat.name }}</h2>
                        <p class="chat-header-status">En línea</p>
                    </div>
                </div>
                <div>
                    <Button icon="pi pi-video" severity="secondary" variant="text" rounded aria-label="Bookmark"
                        class="text-[#129E82] p-1" @click="visibleCreateRoom = true"
                        v-tooltip.bottom="'Iniciar Video llamada'" />
                </div>
            </div>
            <!-- Mensajes -->
            <div class="message-container">
                <div v-for="msg in messages" :key="msg.id" :class="{ 'text-right': msg.user === username }"
                    class="message-item">
                    <p class="message-text" :class="msg.user === username ? 'message-sent' : 'message-received'">
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

    <Dialog v-model:visible="visibleCreateRoom" modal class="w-1/4 h-fit" :style="{ backgroundColor: transparent }"
        pt:root:class="!border-0 !bg-transparent">
        <template #container="{ closeCallback }">
            <div class="bg-[#071a24] flex rounded-full justify-between items-center p-10">
                <span class="text-gray-500"> Comenzar llamada </span>
                <div class="relative w-fit h-fit">
                    <Button icon="pi pi-phone" @click="handleCallClick"
                        class="absolute inset-0 bg-transparent animate-ping text-[#129E82] hover:bg-[#129E82] hover:text-[#071a24] rounded-full pointer-events-none" />
                    <i class="pi pi-phone text-[#129E82] text-xl z-10 relative bg-transparent p-3 rounded-full cursor-pointer"
                        @click="handleCallClick"></i>
                </div>
                <Button icon="pi pi-times" @click="activeCallTeamId = false"
                    class="bg-transparent text-[#C13030] hover:bg-[#C13030] hover:text-[#071a24] hover rounded-full " />
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="visibleVideoCall" class="w-11/12 h-11/12" :style="{ backgroundColor: '#04293C' }" :pt="{
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
                    <Button severity="secondary" @click="endCall" label="Colgar llamada" class="border-[#8a2222] border-2  text-[#8a2222] p-2 text-sm 
                                    font-light hover:bg-[#8a2222] hover:text-white" />
                </div>
                <div>
                    <span class="text-white font-bold">Sala: {{ roomId }}</span>
                    <Button label="Copiar ID" @click="copyToClipboard(roomId)" icon="pi pi-copy"
                        class="text-xs text-[#9F86F9]" />
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
                            <p class="message-text"
                                :class="msg.user === username ? 'message-sent' : 'message-received'">
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
            <video ref="localVideoRef" autoplay muted v-if="cameraOn"
                class="bg-slate-900 absolute top-28 right-10 h-1/5 w-1/4 p-2">
                Tu camara
            </video>
            <video ref="remoteVideoRef" autoplay
                class="w-full h-full bg-black flex flex-col items-center justify-center gap-5">
                <span class="text-xl"> En espera </span>
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            </video>
        </div>
    </Dialog>
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
