<template>
  <div class="team-view" v-if="currentTeamId && !isLoading">
    <div class="team-header" v-if="team">
      <Button icon="pi pi-arrow-left" variant="text" size="small" @click="$emit('backToTeamsList')" rounded
        class="text-gray-500 hover:bg-[#173c4e] mx-[3px]" />
      <h1>{{ team.name }}</h1>
    </div>
    <div v-else-if="!team && !isLoading" class="team-header">
    </div>
    <div v-else class="team-header">
      <h1>Cargando equipo...</h1>
    </div>

    <div class="main-layout">
      <div class="channels-sidebar">
        <h2>Canales</h2>
        <ul v-if="channels.length > 0">
          <li v-for="channel in channels" :key="channel.id" @click="selectChannel(channel)"
            :class="{ 'active-channel': selectedChannel && selectedChannel.id === channel.id }">
            # {{ channel.channel_name }}
          </li>
        </ul>
        <p v-else-if="!isLoadingChannels && team">No hay canales aún.</p>
        <p v-if="isLoadingChannels">Cargando canales...</p>

        <div v-if="isAdmin && team" class="create-channel-section">
          <input v-model="newChannelName" placeholder="Nombre del nuevo canal" @keyup.enter="createChannel" />
          <button @click="createChannel">Crear Canal</button>
        </div>
      </div>

      <div class="chat-area" v-if="selectedChannel">
        <div class="chat-header">
          <h3># {{ selectedChannel.channel_name }}</h3>
        </div>
        <div class="messages-list" ref="messagesContainer">
          <div v-for="msg in messages" :key="msg.id" class="message-item">
            <span class="message-sender">{{ msg.user.username }}:</span>
            <!-- Cloudinary Media-->
            <div v-if="msg.file_info" class="file-message-content">
              <p class="message-content">{{ msg.message }}</p>
              <ManualCldImage v-if="getResourceType(msg.file_info) === 'image'" :cloudName="cldCloudName"
                :public-id="msg.file_info.public_id" width="300" crop="limit" alt="Imagen adjunta"
                class="uploaded-multimedia my-2" />

              <ManualCldVideo v-else-if="getResourceType(msg.file_info) === 'video'" :cloudName="cldCloudName"
                :public-id="msg.file_info.public_id" controls width="400" class="uploaded-multimedia my-2" />

              <a v-else-if="getResourceType(msg.file_info) === 'raw' && msg.file_info.url" :href="msg.file_info.url"
                target="_blank" rel="noopener noreferrer" class="file-download-link uploaded-multimedia my-2">
                Descargar: {{ msg.file_info.name || 'archivo adjunto' }}
                <span v-if="msg.file_info.size">({{ (msg.file_info.size / 1024).toFixed(2) }} KB)</span>
              </a>
              <p v-else class="message-content italic text-gray-500">No se puede mostrar el archivo adjunto.</p>
            </div>
            <!-- End -->
            <p v-else class="message-content">{{ msg.message }}</p>

            <span class="message-time">{{ msg.time }}</span>
          </div>
          <div v-if="messages.length === 0 && !isLoadingMessages" class="no-messages">
            No hay mensajes en este canal todavía.
          </div>
          <div v-if="isLoadingMessages" class="no-messages">Cargando mensajes...</div>
        </div>
        <div class="message-input">
          <div class="pr-2"> <!-- Cloudinary Button-->
            <CloudinaryUploadButton :buttonLabel="null" icon="pi pi-paperclip" :uploadPreset="chatUploadPreset"
              :folder="chatFolder" :tags="['team_chat', currentTeamId, selectedChannel?.id]" source="chat"
              :relatedId="selectedChannel?.id" @upload-success="handleChatFileUpload"
              @upload-error="handleChatUploadError" class="ml-2" />
          </div>
          <input v-model="newMessageText" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..." />
          <button @click="sendMessage">Enviar</button>
        </div>
      </div>
      <div v-else class="chat-area-placeholder">
        <p v-if="team && channels.length > 0">Selecciona un canal para comenzar a chatear.</p>
        <p v-else-if="team && !isLoadingChannels && isAdmin">Crea un canal para comenzar.</p>
        <p v-else-if="team && !isLoadingChannels && !isAdmin">Este equipo aún no tiene canales.</p>
        <p v-if="!team && !isLoading">Selecciona un equipo.</p>
      </div>
    </div>
  </div>
  <div v-else-if="isLoading && currentTeamId" class="loading-placeholder">
    <p>Cargando datos del equipo...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted, defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import socket from '@/utils/socket'; //
import { parseJwt } from '@/utils/jwt'; //
import CloudinaryUploadButton from '@/components/CloudinaryUploadButton.vue';
import ManualCldImage from '@/components/ManualCldImage.vue'; // Ajusta la ruta si es necesario
import ManualCldVideo from '@/components/ManualCldVideo.vue';
import axios from 'axios';

const router = useRoute();


const team = ref(null);
const channels = ref([]);
const selectedChannel = ref(null);
const messages = ref([]);
const newMessageText = ref('');
const newChannelName = ref('');
const currentUser = ref(null);
const isAdmin = ref(false);
const messagesContainer = ref(null);

const isLoading = ref(false);
const isLoadingChannels = ref(false);
const isLoadingMessages = ref(false);

const API_BASE_URL = 'http://localhost:3000'; // Ensure this matches your backend URL
const token = localStorage.getItem('user_token');// token de usuario

const props = defineProps({
  currentTeamId: {
    type: String, // currentTeamId es el ID del equipo (string)
    default: null,
  },
  roomType: { // roomType indica si es 'channel' o 'private', etc.
    type: String,
    default: 'channel', // Podrías poner un default si siempre va a ser 'channel' aquí
  }
});
// ============================================
const cldCloudName = 'duhrxfco6';

// (Opcional) Helper para determinar el tipo de recurso de forma más limpia
const getResourceType = (fileInfo) => {
  if (!fileInfo || !fileInfo.type) return 'raw'; // 'raw' es el tipo para archivos genéricos en Cloudinary
  if (fileInfo.type.startsWith('image/')) return 'image';
  if (fileInfo.type.startsWith('video/')) return 'video';
  return 'raw';
};

// Recupera el preset de las variables de entorno de Vite
const chatUploadPreset = 'vue_chat_uploads';

const chatFolder = computed(() => {
  if (props.roomType === 'private') {
    return `chats/private/${props.currentTeamId}`;
  } else if (props.roomType === 'channel') {
    return `teams/${props.currentTeamId}/channels/${selectedChannel.value.id}`;
  }
  return 'chats/unknown';
});


const handleChatFileUpload = (fileData) => {
  console.log('File uploaded for chat:', fileData);
  // Enviar un mensaje a través de Socket.IO con la información del archivo
  const messagePayload = {
    room: selectedChannel.value.id, // ID de la sala de socket
    sender_id: currentUser.value.id, // ID del usuario que envía
    message: `Archivo: ${fileData.original_filename}`, // Mensaje de texto opcional
    file_info: { // Información del archivo para guardar y mostrar
      url: fileData.url,
      type: fileData.file_type,
      name: fileData.original_filename,
      size: fileData.bytes,
      public_id: fileData.public_id
    },
    roomType: props.roomType,
    team_id: team.value.id,
    channel_name: selectedChannel.value?.channel_name,
  };

  // Tu lógica de sendMessage en server.js necesita manejar 'file_info'
  socket.emit('sendMessage', messagePayload);
};

const handleChatUploadError = (error) => {
  console.error("Chat upload error:", error);
  // Mostrar notificación de error al usuario
  alert(`Error uploading file: ${error.message || 'Unknown error'}`);
};
// ============================================
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const resetComponentState = () => {
  team.value = null;
  channels.value = [];
  selectedChannel.value = null;
  messages.value = [];
  isAdmin.value = false;
  newChannelName.value = '';
  newMessageText.value = '';
};

const initializeTeamData = async (teamIdToLoad) => {
  if (!teamIdToLoad) {
    resetComponentState();
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  resetComponentState(); // Limpia el estado anterior antes de cargar nuevo

  const decoded = parseJwt(token);
  currentUser.value = decoded;

  if (!currentUser.value) {
    console.error("Usuario no autenticado.");
    router.push('/login');
    isLoading.value = false;
    return;
  }

  try {

    // 1. Fetch Detalles del Equipo
    // Asumimos que /api/my-teams devuelve los equipos del usuario y podemos filtrar.
    // Si tienes un endpoint /api/teams/:id que devuelva solo uno, sería más directo.
    const teamDetailsResponse = await axios.get(`${API_BASE_URL}/api/my-teams`, { //
      headers: { 
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
       }
    });
    let foundTeam = null;
    if (teamDetailsResponse.data.success) {
      foundTeam = teamDetailsResponse.data.teams.find(t => t.id === teamIdToLoad);
    }

    if (foundTeam) {
      team.value = {
        id: foundTeam.id,
        name: foundTeam.team_name,
        owner_id: foundTeam.owner_id,
      };

      // 2. Fetch Miembros del Equipo y Establecer si es Admin
      const membersResponse = await axios.get(`${API_BASE_URL}/api/teams/${teamIdToLoad}/members`, {
        headers: { Authorization: `Bearer ${token}`,'ngrok-skip-browser-warning': 'true' }
      });
      if (membersResponse.data.success) {
        const currentUserMemberInfo = membersResponse.data.members.find(m => m.user_id === currentUser.value.id);
        isAdmin.value = (currentUserMemberInfo && currentUserMemberInfo.role === 'admin') || (currentUser.value.id === team.value.owner_id);
      } else {
        isAdmin.value = (currentUser.value.id === team.value.owner_id); // Fallback
      }

      // 3. Fetch Canales
      isLoadingChannels.value = true;
      const channelsResponse = await axios.get(`${API_BASE_URL}/api/teams/${teamIdToLoad}/channels`, {
        headers: { Authorization: `Bearer ${token}`,'ngrok-skip-browser-warning': 'true' }
      });
      if (channelsResponse.data.success) {
        channels.value = channelsResponse.data.channels;
        if (channels.value.length > 0) {
          // Podrías auto-seleccionar el primer canal si lo deseas:
          // selectChannel(channels.value[0]);
        }
      } else {
        channels.value = [];
      }
      isLoadingChannels.value = false;

    } else {
      console.error(`Equipo con ID ${teamIdToLoad} no encontrado.`);
      // No es necesario redirigir aquí, el padre maneja la visualización.
    }
  } catch (error) {
    console.error("Error inicializando datos del equipo:", error.response ? error.response.data : error.message);
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.currentTeamId, (newTeamId) => {
  console.log(`GeneralTeams: currentTeamId cambió a: ${newTeamId}`);
  initializeTeamData(newTeamId);
}, { immediate: true });

const fetchTeamDetails = async (id) => {
  try {
    // Assuming /api/my-teams returns an array of teams user is part of
    // You might need a specific endpoint like /api/teams/:id if not already covered
    const response = await axios.get(`${API_BASE_URL}/api/my-teams`, {
      headers: { Authorization: `Bearer ${token}`,'ngrok-skip-browser-warning': 'true' }
    });
    if (response.data.success) {
      const foundTeam = response.data.teams.find(t => t.id === id);
      if (foundTeam) {
        team.value = { // Map to a simpler team object for the view
          id: foundTeam.id,
          name: foundTeam.team_name,
          owner_id: foundTeam.owner_id,
          // caption: foundTeam.caption, // from schema
          // image: foundTeam.image // from schema
        };
      } else {
        console.error("Team not found in user's teams or API error.");
        // router.push('/home'); // Or some error page
      }
    }
  } catch (error) {
    console.error("Error fetching team details:", error);
    // router.push('/login'); // Or handle error appropriately
  }
};

const fetchTeamMembersAndSetAdmin = async (currentTeamId) => {
  if (!currentUser.value) return;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teams/${currentTeamId}/members`, {
      headers: { Authorization: `Bearer ${token}`,'ngrok-skip-browser-warning': 'true'}
    });
    if (response.data.success) {
      const currentUserMemberInfo = response.data.members.find(m => m.user_id === currentUser.value.id);
      if (currentUserMemberInfo && currentUserMemberInfo.role === 'admin') {
        isAdmin.value = true;
      } else if (team.value && currentUser.value.id === team.value.owner_id) { // Fallback to owner
        isAdmin.value = true;
      } else {
        isAdmin.value = false;
      }
    }
  } catch (error) {
    console.error("Error fetching team members:", error);
    // Fallback check if team owner
    if (team.value && currentUser.value && currentUser.value.id === team.value.owner_id) {
      isAdmin.value = true;
    } else {
      isAdmin.value = false;
    }
  }
};

const fetchChannels = async (currentTeamId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teams/${currentTeamId}/channels`, {
      headers: { Authorization: `Bearer ${token}`,'ngrok-skip-browser-warning': 'true' }
    });
    if (response.data.success) {
      channels.value = response.data.channels;
      // Optionally auto-select the first channel if none is selected and channels exist
      if (channels.value.length > 0 && !selectedChannel.value) {
        // selectChannel(channels.value[0]); // Decide if you want to auto-select
      }
    }
  } catch (error) {
    console.error("Error fetching channels:", error);
    channels.value = [];
  }
};

// --- Manejadores de Eventos de Socket ---
const handlePreviousMessages = (loadedMessages) => {
  isLoadingMessages.value = false;
  if (selectedChannel.value) { // Asegurarse que hay un canal seleccionado
    // El servidor ya filtra los mensajes por sala, así que si `loadedMessages[0].room` existe y coincide, es para este canal.
    // O si es un array vacío, también es para este canal (sin mensajes).
    if (loadedMessages.length > 0 && loadedMessages[0].room === selectedChannel.value.id) {
      messages.value = loadedMessages;
    } else if (loadedMessages.length === 0) { // Array vacío significa que no hay mensajes para ESTA sala
      messages.value = [];
    }
    // Si loadedMessages[0].room no coincide, es un mensaje tardío de otra sala, no lo cargues.
  } else {
    messages.value = []; // No hay canal seleccionado, no mostrar mensajes.
  }
  scrollToBottom();
};

const handleReceiveMessage = (newMessage) => {
  if (selectedChannel.value && newMessage.room === selectedChannel.value.id) {
    messages.value.push(newMessage);
    scrollToBottom();
  }
};

const handleMessageError = (error) => {
  console.error("Error de mensaje desde el servidor:", error.message);
  alert(`Error de mensaje: ${error.message}`);
};

// Registrar y limpiar listeners de socket
onMounted(() => {
  socket.on("previousMessages", handlePreviousMessages);
  socket.on("receiveMessage", handleReceiveMessage);
  socket.on("messageError", handleMessageError);
});

onUnmounted(() => {
  socket.off("previousMessages", handlePreviousMessages);
  socket.off("receiveMessage", handleReceiveMessage);
  socket.off("messageError", handleMessageError);
  if (selectedChannel.value) {
    // Considerar si es necesario un evento socket.emit("leaveRoom", selectedChannel.value.id);
  }
});

// Observador para cuando cambia el canal seleccionado
watch(selectedChannel, (newCh, oldCh) => {
  if (newCh && (!oldCh || newCh.id !== oldCh.id)) {
    messages.value = [];
    isLoadingMessages.value = true;
    socket.emit("joinAllRooms", [newCh.id]); //
    console.log(`[Cliente] Cambiado a canal. Emitiendo loadMessages para sala: ${newCh.id}, tipo: channel`);
    socket.emit("loadMessages", { room: newCh.id, roomType: 'channel' }); //
  } else if (!newCh) {
    messages.value = [];
  }
});

// --- Métodos ---
const selectChannel = (channel) => {
  if (selectedChannel.value?.id !== channel.id) {
    selectedChannel.value = channel;
  }
};

const sendMessage = () => {
  if (!newMessageText.value.trim() || !selectedChannel.value || !currentUser.value || !team.value) return;
  socket.emit("sendMessage", { //
    room: selectedChannel.value.id,
    message: newMessageText.value,
    sender_id: currentUser.value.id,
    team_id: team.value.id,
    channel_name: selectedChannel.value.channel_name,
    roomType: 'channel',
  });
  newMessageText.value = '';
};

const createChannel = async () => {
  if (!newChannelName.value.trim() || !isAdmin.value || !team.value) {
    alert("El nombre del canal no puede estar vacío, no tienes permiso o no hay un equipo cargado.");
    return;
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/api/teams/${team.value.id}/channels`,
      { channel_name: newChannelName.value },
      { headers: { Authorization: `Bearer ${token}`,'ngrok-skip-browser-warning': 'true' } }
    );
    if (response.data.success && response.data.channel) {
      if (!channels.value.find(ch => ch.id === response.data.channel.id)) {
        channels.value.push(response.data.channel);
      }
      newChannelName.value = '';
      selectChannel(response.data.channel);
    } else {
      alert(`Error al crear canal: ${response.data.error || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error("Error API al crear canal:", error);
    alert(`Error API al crear canal: ${error.response?.data?.error || error.message}`);
  }
};

</script>
<style scoped>
/* Los estilos son similares a la respuesta anterior, puedes mantenerlos o ajustarlos */
.team-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  /* Ajusta si tienes una barra de navegación global */
  color: var(--p-text-color);
  background-color: var(--p-surface-900);
}

.loading-placeholder,
.no-team-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--p-text-muted-color);
}

.team-header {
  display: flex;
  padding: 1rem .5rem;
  background-color: var(--p-surface-800);
  border-bottom: 1px solid var(--p-surface-700);
  color: #8164ed;
}

.team-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.main-layout {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.channels-sidebar {
  width: 280px;
  background-color: var(--p-surface-800);
  padding: 1rem;
  border-right: 1px solid var(--p-surface-700);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.channels-sidebar h2 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
}

.channels-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.channels-sidebar li {
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  border-radius: var(--p-content-border-radius);
  margin-bottom: 0.25rem;
  color: var(--p-text-muted-color);
  transition: background-color 0.2s, color 0.2s;
}

.channels-sidebar li:hover {
  background-color: var(--p-content-hover-background);
  color: var(--p-text-hover-color);
}

.channels-sidebar li.active-channel {
  background-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-weight: 500;
}

.channels-sidebar p {
  /* Para mensajes de "No hay canales" */
  color: var(--p-text-muted-color);
  font-style: italic;
  text-align: center;
  margin-top: 1rem;
}

.create-channel-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-700);
}

.create-channel-section input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.5rem;
  background-color: var(--p-surface-700);
  border: 1px solid var(--p-surface-600);
  color: white;
  border-radius: 4px;
  box-sizing: border-box;
}

.create-channel-section button {
  width: 100%;
  padding: 0.6rem 1rem;
  background-color: var(--p-primary-500);
  color: var(--p-primary-contrast-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.create-channel-section button:hover {
  background-color: var(--p-primary-600);
}

.chat-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--p-surface-900);
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--p-surface-700);
  background-color: var(--p-surface-800);
  color: cornflowerblue;
}

.chat-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.chat-area-placeholder {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--p-text-muted-color);
  padding: 2rem;
  text-align: center;
}

.messages-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.message-item {
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.9rem;
  background-color: var(--p-surface-800);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.message-sender {
  font-weight: 600;
  color: var(--p-primary-500);
  margin-bottom: 0.25rem;
  font-size: 0.9em;
}

.message-content {
  margin: 0;
  line-height: 1.5;
  word-break: break-word;
  color: aliceblue;
}

.message-time {
  font-size: 0.75em;
  color: var(--p-text-muted-color);
  margin-top: 0.25rem;
  align-self: flex-end;
}

.no-messages {
  text-align: center;
  color: var(--p-text-muted-color);
  margin-top: 2rem;
  font-style: italic;
}

.message-input {
  display: flex;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--p-surface-700);
  background-color: var(--p-surface-800);
}

.message-input input {
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid var(--p-surface-600);
  background-color: var(--p-surface-700);
  color: white;
  border-radius: 4px;
  margin-right: 0.75rem;
}

.message-input button {
  padding: 0.75rem 1.5rem;
  background-color: var(--p-primary-500);
  color: var(--p-primary-contrast-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.message-input button:hover {
  background-color: var(--p-primary-600);
}
/*
.file-message-content {

}
.uploaded-multimedia {
  display: block; 
  max-width: 100%; 
  border-radius: 6px; 
}
.file-download-link {
  color: var(--p-primary-400); /
  text-decoration: underline;
  padding: 0.25rem 0;
}
.file-download-link:hover {
  color: var(--p-primary-300);
}
.my-2 { 
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
*/

</style>
