<template>
    <div class="chat-container flex h-screen">
        <div class="sidebar w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
            <div class="user-profile mb-4 flex items-center">
                <Avatar :image="currentUser.avatar || '/default_avatar.png'" @click="toggleCurrentUserPopover($event)"
                    aria-haspopup="true" aria-controls="currentUserPopover" class="cursor-pointer"
                    v-tooltip.bottom="'My Profile'" />
                <span class="ml-2 font-semibold">{{ currentUser.username }}</span>
                <Popover ref="currentUserPopoverRef" id="currentUserPopover">
                    <div class="p-3 min-w-[200px]">
                        <img :src="currentUser.avatar || '/default_avatar.png'" alt="avatar"
                            class="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                        <div class="text-center">
                            <div class="font-bold text-lg">{{ currentUser.username }}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">{{ currentUser.email }}</div>
                            <div class="text-xs mt-1">Reward Points: {{ currentUser.reward_points }}</div>
                        </div>
                    </div>
                </Popover>
            </div>

            <InputText v-model="searchTerm" placeholder="Search..." class="w-full mb-4 bg-gray-700 border-gray-600" />

            <h3 class="text-lg font-semibold mb-2 mt-4">Direct Messages</h3>
            <ul>
                <li v-for="contact in filteredPrivateContacts" :key="contact.id" @click="selectChat(contact, 'private')"
                    class="p-2 hover:bg-gray-700 cursor-pointer rounded flex items-center mb-1">
                    <Avatar :image="contact.avatar || '/default_avatar.png'" class="mr-2"
                        @click.stop="showUserPopover($event, contact)" aria-haspopup="true"
                        aria-controls="userContactPopover" v-tooltip.bottom="'View Profile'" />
                    <span>{{ contact.username }}</span>
                    <span v-if="contact.status === 'online'" class="ml-auto w-2 h-2 bg-green-500 rounded-full"
                        title="Online"></span>
                </li>
            </ul>
            <Popover ref="userPopoverRef" id="userContactPopover">
                <div v-if="selectedPopoverUser && selectedPopoverUser.isLoading" class="p-2">Loading...</div>
                <div v-else-if="selectedPopoverUser && selectedPopoverUser.error" class="p-2 text-red-500">{{
                    selectedPopoverUser.error }}</div>
                <div v-else-if="selectedPopoverUser && selectedPopoverUser.id" class="p-3 min-w-[200px]">
                    <img :src="selectedPopoverUser.avatar || '/default_avatar.png'" alt="avatar"
                        class="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                    <div class="text-center">
                        <div class="font-bold text-lg">{{ selectedPopoverUser.username }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">{{ selectedPopoverUser.email }}</div>
                        <div class="text-xs mt-1">Status: <span
                                :class="selectedPopoverUser.status === 'online' ? 'text-green-400' : 'text-gray-400'">{{
                                selectedPopoverUser.status }}</span></div>
                        <div class="text-xs mt-1">Reward Points: {{ selectedPopoverUser.reward_points }}</div>
                    </div>
                </div>
            </Popover>

            <h3 class="text-lg font-semibold mt-6 mb-2">Team Channels</h3>
            <div v-for="team in filteredTeams" :key="team.id" class="mb-3">
                <div class="font-medium p-2 hover:bg-gray-600 rounded flex items-center cursor-pointer"
                    @click.stop="showTeamPopover($event, team)">
                    <Avatar :image="team.image || '/default_team_avatar.png'" class="mr-2" /> {{ team.team_name }}
                </div>
                <ul class="ml-4 mt-1">
                    <li v-for="channel in team.channels" :key="channel.id" @click="selectChat(channel, 'channel', team)"
                        class="p-2 pl-4 hover:bg-gray-700 cursor-pointer rounded text-sm">
                        # {{ channel.channel_name }}
                    </li>
                </ul>
            </div>
            <Popover ref="teamPopoverRef" id="teamPopover">
                <div v-if="selectedPopoverTeam && selectedPopoverTeam.isLoading" class="p-2">Loading team details...
                </div>
                <div v-else-if="selectedPopoverTeam && selectedPopoverTeam.error" class="p-2 text-red-500">{{
                    selectedPopoverTeam.error }}</div>
                <div v-else-if="selectedPopoverTeam && selectedPopoverTeam.id" class="p-2 min-w-[250px]">
                    <img :src="selectedPopoverTeam.image || '/default_team_avatar.png'" alt="team avatar"
                        class="w-20 h-20 rounded-full mx-auto mb-2 object-cover" />
                    <div class="text-center font-bold text-lg mb-1">{{ selectedPopoverTeam.team_name }}</div>
                    <p v-if="selectedPopoverTeam.caption" class="text-sm text-gray-300 mb-2 break-words"><em>{{
                        selectedPopoverTeam.caption }}</em></p>
                    <div v-if="selectedPopoverTeam.ownerDetails" class="text-xs mb-2">
                        Owner: {{ selectedPopoverTeam.ownerDetails.username }}
                    </div>
                    <div v-if="selectedPopoverTeam.members && selectedPopoverTeam.members.length">
                        <h4 class="font-semibold mt-2 text-sm">Members ({{ selectedPopoverTeam.members.length }}):</h4>
                        <ul class="text-xs max-h-24 overflow-y-auto">
                            <li v-for="member in selectedPopoverTeam.members" :key="member.user_id">
                                {{ member.username }} ({{ member.role }})
                            </li>
                        </ul>
                    </div>
                </div>
            </Popover>
        </div>

    <div class="chat-area flex-1 flex flex-col bg-gray-700">
      <div v-if="selectedChat.id || (selectedChat.roomType === 'private' && selectedChat.recipientId)"
          class="chat-header p-4 bg-gray-800 text-white border-b border-gray-600 flex items-center justify-between">
        <div class="flex items-center">
          <template v-if="selectedChat.roomType === 'private' && selectedChat.recipientId">
            <Avatar 
              v-if="selectedChat.avatar" 
              :image="selectedChat.avatar || '/default_avatar.png'" class="mr-3 cursor-pointer" 
              @click="showChatHeaderContactPopover($event)"
              aria-haspopup="true"
              aria-controls="chatHeaderContactPopover"
              v-tooltip.bottom="'View Profile'"
            />
            <h2 
              class="text-xl cursor-pointer hover:underline" 
              @click="showChatHeaderContactPopover($event)"
              aria-haspopup="true"
              aria-controls="chatHeaderContactPopover"
            >
              {{ selectedChat.name }}
            </h2>
          </template>
          <template v-else> <Avatar :image="selectedChat.avatar || '/default_team_avatar.png'" class="mr-3" /> <h2 class="text-xl">{{ selectedChat.name }}</h2>
          </template>
        </div>
        
        <Button 
          v-if="selectedChat.roomType === 'private' && selectedChat.recipientId"
          icon="pi pi-video" 
          @click="startCall"
          :disabled="isInCall"
          class="p-button-rounded p-button-text"
          v-tooltip.bottom="isInCall ? 'Call in progress' : 'Start video call'"
        />
      </div>
      <div v-else class="no-chat-selected flex-1 flex items-center justify-center text-gray-400">
        <p class="text-2xl">Select a chat to start messaging</p>
      </div>
      
      <Popover ref="chatHeaderContactPopoverRef" id="chatHeaderContactPopover">
        <div v-if="activeChatContactDetails && activeChatContactDetails.isLoading" class="p-2">Loading contact info...</div>
        <div v-else-if="activeChatContactDetails && activeChatContactDetails.error" class="p-2 text-red-500">{{ activeChatContactDetails.error }}</div>
        <div v-else-if="activeChatContactDetails && activeChatContactDetails.id" class="p-3 min-w-[200px]">
          <img :src="activeChatContactDetails.avatar || '/default_avatar.png'" alt="avatar" class="w-16 h-16 rounded-full mx-auto mb-2 object-cover"/>
          <div class="text-center">
            <div class="font-bold text-lg">{{ activeChatContactDetails.username }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ activeChatContactDetails.email }}</div>
            <div class="text-xs mt-1">Status: <span 
                :class="activeChatContactDetails.status === 'online' ? 'text-green-400' : 'text-gray-400'">{{ activeChatContactDetails.status }}</span></div>
            <div class="text-xs mt-1">Reward Points: {{ activeChatContactDetails.reward_points }}</div>
          </div>
        </div>
      </Popover>

            <div class="messages flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainerRef">
                <div v-for="msg in messages" :key="msg.id"
                    :class="['message-item flex flex-col', msg.user.id === currentUser.id ? 'items-end' : 'items-start']">
                    <div
                        :class="['message-bubble p-3 rounded-lg max-w-lg break-words', msg.user.id === currentUser.id ? 'bg-[var(--p-primary-500)] text-white' : 'bg-gray-600 text-white']">
                        <div class="font-semibold text-sm mb-1">{{ msg.user.username }}</div>
                        <p v-if="msg.message && (!msg.file_info || (msg.file_info && msg.message !== `Archivo: ${msg.file_info.name}`))"
                            class="whitespace-pre-wrap">{{ msg.message }}</p>

                        <div v-if="msg.file_info" class="mt-2 p-2 bg-opacity-20 bg-black rounded">
                            <a :href="msg.file_info.url" target="_blank" rel="noopener noreferrer"
                                class="underline break-all flex items-center text-sm hover:text-blue-300">
                                <i :class="getFileIcon(msg.file_info.type)" class="mr-2 text-lg"></i>
                                <span class="flex-1 truncate">{{ msg.file_info.name || msg.file_info.original_filename
                                    || 'Attached File' }}</span>
                            </a>
                            <div v-if="isImage(msg.file_info.type) && msg.file_info.public_id" class="mt-1">
                                <ManualCldImage :publicId="msg.file_info.public_id" :cloudName="cloudinaryCloudName"
                                    :alt="msg.file_info.name || 'shared image'"
                                    class="max-w-full max-h-60 rounded mt-1 cursor-pointer object-contain"
                                    @click="openImageModal(msg.file_info.url)" width="300" height="240" crop="limit"
                                    fetchFormat="auto" quality="auto" />
                            </div>
                            <div v-else-if="isVideo(msg.file_info.type) && msg.file_info.public_id" class="mt-1">
                                <ManualCldVideo :publicId="msg.file_info.public_id" controls
                                    :cloudName="cloudinaryCloudName" class="max-w-full max-h-60 rounded mt-1"
                                    width="300" height="240" crop="limit" fetchFormat="auto" quality="auto" />
                            </div>
                            <div v-else-if="isAudio(msg.file_info.type)" class="mt-1">
                                <audio :src="msg.file_info.url" controls class="w-full"></audio>
                            </div>
                            <div class="text-xs text-gray-300 mt-1">{{ formatBytes(msg.file_info.size ||
                                msg.file_info.bytes) }}</div>
                        </div>
                        <div class="flex items-end justify-end gap-2">
                            <i v-if="msg.is_encrypted" class="pi pi-lock ml-1" style="font-size: 0.8rem;"
                                title="Este mensaje fue guardado cifrado en el servidor"></i>
                            <div class="text-xs text-opacity-80 mt-1 text-right">{{ msg.time }}</div>
                        </div>

                    </div>
                </div>
            </div>

            <div v-if="selectedChat.id || (selectedChat.roomType === 'private' && selectedChat.recipientId)"
                class="message-input p-4 bg-gray-800 border-t border-gray-600 flex items-center gap-2">
                <CloudinaryUploadButton :uploadPreset="cloudinaryChatPreset" :folder="cloudinaryChatFolder"
                    :tags="['chat', selectedChat.roomType || 'unknown', selectedChat.id || 'new']"
                    @upload-success="handleFileUpload" @upload-error="handleUploadError" icon="pi pi-paperclip" rounded
                    text />
                <Textarea v-model="newMessage" @keydown.enter.prevent="handleEnterKey" placeholder="Type a message..."
                    class="flex-1" autoResize rows="1" />
                <Button @click="sendMessage()" label="Send" icon="pi pi-send"
                    :disabled="!newMessage.trim() && !pendingFile" />
            </div>
        </div>
    </div>

  <Dialog v-model:visible="isImageModalVisible" modal header="Image Preview" :style="{ width: '75vw' }"
      :breakpoints="{ '960px': '90vw' }">
    <img :src="modalImageUrl" alt="Preview" class="w-full h-auto max-h-[80vh] object-contain" />
  </Dialog>

  <Dialog 
    v-model:visible="callDialogVisible" 
    :modal="true" 
    :closable="false"
    :style="{ width: '90vw', maxWidth: '800px' }"
    :header="callStatus"
  >
    <div class="grid grid-cols-2 gap-4">
      <div class="relative">
        <video 
          ref="localVideoRef" 
          autoplay 
          muted 
          playsinline
          class="w-full rounded-lg bg-black"
        ></video>
        <div class="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          You
        </div>
      </div>
      <div class="relative">
        <video 
          ref="remoteVideoRef" 
          autoplay 
          playsinline
          class="w-full rounded-lg bg-black"
        ></video>
        <div class="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          {{ isCallIncoming ? currentCall?.name : selectedChat?.name }}
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-center gap-2">
        <Button 
          v-if="isCallIncoming"
          icon="pi pi-phone" 
          @click="answerCall"
          class="p-button-success"
          label="Answer"
        />
        <Button 
          v-if="isCallIncoming"
          icon="pi pi-times" 
          @click="rejectCall"
          class="p-button-danger"
          label="Reject"
        />
        <Button 
          v-if="isCallActive || isInCall"
          icon="pi pi-phone-slash" 
          @click="endCall"
          class="p-button-danger"
          label="End Call"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import socket from '@/utils/socket';
import { parseJwt } from '@/utils/jwt';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Popover from 'primevue/popover';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import CloudinaryUploadButton from '@/components/CloudinaryUploadButton.vue';
import ManualCldImage from '@/components/ManualCldImage.vue';
import ManualCldVideo from '@/components/ManualCldVideo.vue';
import apiService from '@/services/apiService';
import Peer from 'peerjs';

const cloudinaryCloudName = 'duhrxfco6';

// --- Estado del Usuario y Contactos ---
const currentUser = ref({ id: null, username: 'User', email: '', avatar: '', reward_points: 0 });
const privateContacts = ref([]);
const teamsAndChannels = ref([]);
const searchTerm = ref('');
const selectedChat = ref({ id: null, name: '', roomType: null, teamId: null, recipientId: null, avatar: null });

// --- Mensajes ---
const messages = ref([]);
const newMessage = ref('');
const pendingFile = ref(null);
const messagesContainerRef = ref(null);

// --- Popovers Refs y Datos ---
const currentUserPopoverRef = ref();
const userPopoverRef = ref();
const selectedPopoverUser = ref(null);
const teamPopoverRef = ref();
const selectedPopoverTeam = ref(null);
const chatHeaderContactPopoverRef = ref();
const activeChatContactDetails = ref(null);

// --- Modal de Imagen ---
const isImageModalVisible = ref(false);
const modalImageUrl = ref('');

// --- Configuración Cloudinary ---
const cloudinaryChatPreset = 'vue_chat_uploads';
const cloudinaryChatFolder = computed(() => {
    if (!selectedChat.value || !selectedChat.value.id) return `vue_chat_uploads/unsorted`;
    return `vue_chat_uploads/${selectedChat.value.roomType || 'unknown'}/${selectedChat.value.id}`;
});

// --- Lógica de Popovers --- (sin cambios, asumo que está como en tu última versión)
const toggleCurrentUserPopover = (event) => {
    if (currentUserPopoverRef.value) {
        currentUserPopoverRef.value.toggle(event);
    }
};

const showUserPopover = async (event, userFromList) => {
    selectedPopoverUser.value = { ...userFromList, isLoading: true, error: null };
    if (userPopoverRef.value) userPopoverRef.value.toggle(event);
    else return;

    try {
        const fullUserDetails = await apiService.getUserDetails(userFromList.id);
        selectedPopoverUser.value = { ...(fullUserDetails || userFromList), isLoading: false };
    } catch (error) {
        console.error("Error fetching user details for sidebar popover:", error);
        selectedPopoverUser.value = { ...userFromList, isLoading: false, error: 'Failed to load details' };
    }
};

const showTeamPopover = async (event, team) => {
    selectedPopoverTeam.value = { ...team, members: (team.members || []), ownerDetails: null, isLoading: true, error: null };
    if (teamPopoverRef.value) teamPopoverRef.value.toggle(event);
    else return;

    try {
        const membersData = await apiService.getTeamMembers(team.id);
        const ownerDetails = team.owner_id ? await apiService.getUserDetails(team.owner_id) : null;
        selectedPopoverTeam.value = { ...team, members: membersData || [], ownerDetails, isLoading: false };
    } catch (error) {
        console.error("Error fetching team details for popover:", error);
        selectedPopoverTeam.value = { ...team, members: (team.members || []), ownerDetails: null, isLoading: false, error: 'Failed to load details' };
    }
};

const showChatHeaderContactPopover = async (event) => {
    if (!selectedChat.value || selectedChat.value.roomType !== 'private' || !selectedChat.value.recipientId) {
        return;
    }
    activeChatContactDetails.value = {
        id: selectedChat.value.recipientId,
        username: selectedChat.value.name,
        avatar: selectedChat.value.avatar,
        isLoading: true,
        error: null
    };
    if (chatHeaderContactPopoverRef.value) chatHeaderContactPopoverRef.value.toggle(event);
    else return;

  try {
    const fullContactDetails = await apiService.getUserDetails(selectedChat.value.recipientId);
    activeChatContactDetails.value = { ...(fullContactDetails || activeChatContactDetails.value), isLoading: false };
  } catch (error) {
    console.error("Error fetching contact details for chat header popover:", error);
    activeChatContactDetails.value = { 
      ...activeChatDetails.value, 
      isLoading: false, 
      error: 'Failed to load details' 
    };
  }
};

// --- Filtros ---
const filteredPrivateContacts = computed(() => {
    if (!searchTerm.value) return privateContacts.value;
    return privateContacts.value.filter(c => c.username.toLowerCase().includes(searchTerm.value.toLowerCase()));
});

const filteredTeams = computed(() => {
    if (!searchTerm.value.trim()) return teamsAndChannels.value;
    const searchLower = searchTerm.value.toLowerCase();
    return teamsAndChannels.value
        .map(team => {
            const teamNameMatches = team.team_name.toLowerCase().includes(searchLower);
            const matchingChannels = team.channels.filter(ch => ch.channel_name.toLowerCase().includes(searchLower));
            if (teamNameMatches || matchingChannels.length > 0) {
                return { ...team, channels: teamNameMatches ? team.channels : matchingChannels };
            }
            return null;
        })
        .filter(Boolean);
});

// --- Scroll y Watchers ---
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainerRef.value) {
            messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
        }
    });
};
watch(messages, scrollToBottom, { deep: true, flush: 'post' });

// --- Manejadores de Eventos de Socket --- (Definidos fuera de onMounted para poder referenciarlos en onUnmounted)
const handleReceiveMessage = (message) => {
    console.log("Socket: receiveMessage event", message); // Log para depurar
    if (selectedChat.value.id === message.room ||
        (selectedChat.value.roomType === 'private' &&
            (message.user.id === selectedChat.value.recipientId || message.user.id === currentUser.value.id) &&
            message.room === selectedChat.value.id
        )
    ) {
        messages.value.push(message);
        // scrollToBottom(); // watch(messages, ...) ya se encarga de esto
    } else {
        console.log("Received message for a different room/chat:", message.room, "Selected chat:", selectedChat.value.id);
    }
};

const handlePreviousMessages = (prevMessages) => {
    console.log("Socket: previousMessages event", prevMessages); // Log para depurar
    messages.value = prevMessages;
    // scrollToBottom(); // watch(messages, ...) ya se encarga de esto
};

const handleMessageError = (error) => {
    console.error("Socket: messageError event", error.message);
};


// --- Ciclo de Vida y Sockets ---
onMounted(async () => {
    console.log("Chat.vue: onMounted - Start");
    const token = localStorage.getItem('user_token');
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.id) {
            try {
                const userDetails = await apiService.getUserDetails(decodedToken.id);
                if (userDetails) {
                    currentUser.value = {
                        ...currentUser.value,
                        ...userDetails,
                        avatar: userDetails.avatar || currentUser.value.avatar,
                        id: decodedToken.id,
                        username: decodedToken.username
                    };
                } else {
                    currentUser.value.id = decodedToken.id;
                    currentUser.value.username = decodedToken.username || 'User';
                    currentUser.value.avatar = currentUser.value.avatar || '';
                }
            } catch (error) {
                console.error("Chat.vue: Failed to fetch current user details onMount:", error);
                currentUser.value.id = decodedToken.id;
                currentUser.value.username = decodedToken.username || 'User';
                currentUser.value.avatar = currentUser.value.avatar || '';
            }
        } else {
            console.error("Chat.vue: Invalid token/ID in onMounted. Cannot proceed.");
            // Considerar redireccionar a login si es crítico: router.push('/login');
            return;
        }
    } else {
        console.error("Chat.vue: No token found in onMounted. Cannot proceed.");
        // Considerar redireccionar a login: router.push('/login');
        return;
    }

    console.log("Chat.vue: Current user is:", currentUser.value);
    await fetchContactsAndChannels();

    // Registrar listeners de socket
    console.log("Chat.vue: Registering socket listeners in onMounted");
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("previousMessages", handlePreviousMessages);
    socket.on("messageError", handleMessageError);

  // Join rooms (puede que quieras refinar esta lógica para unirse solo a las salas necesarias)
  const teamChannelRoomIds = teamsAndChannels.value.flatMap(team => team.channels.map(ch => ch.id));
  if (teamChannelRoomIds.length > 0) {
    console.log("Chat.vue: Joining team channel rooms:", teamChannelRoomIds);
    socket.emit('joinAllRooms', teamChannelRoomIds);
  }

  // Initialize PeerJS
  initializePeer();

  // Add socket listeners for call notifications
  socket.on('call-user', (data) => {
    // The actual call handling is done by PeerJS
    // This is just for UI notifications
    if (!isInCall.value) {
      handleIncomingCall(data);
    }
  });

  socket.on('call-rejected', () => {
    alert('Call was rejected');
    endCall();
  });

  socket.on('call-ended', () => {
    alert('Call ended');
    endCall();
  });

  console.log("Chat.vue: onMounted - End");
});

// ***** AÑADIDO: Limpiar listeners de socket cuando el componente se destruye *****
onUnmounted(() => {
  console.log("Chat.vue: onUnmounted - Cleaning up socket listeners");
  socket.off("receiveMessage", handleReceiveMessage);
  socket.off("previousMessages", handlePreviousMessages);
  socket.off("messageError", handleMessageError);
  // Si te unes a salas específicas al seleccionar chat, considera emitir "leaveRoom" aquí para selectedChat.value.id si existe

  // Remove call-related socket listeners
  socket.off('call-user');
  socket.off('call-rejected');
  socket.off('call-ended');
  
  // Clean up PeerJS
  if (peer.value) {
    peer.value.destroy();
    peer.value = null;
  }
  
  // Clean up any active call
  endCall();
});


const fetchContactsAndChannels = async () => {
    try {
        const [contactsData, teamsData] = await Promise.all([
            apiService.getPrivateContacts(),
            apiService.getMyTeamsAndChannels()
        ]);
        privateContacts.value = contactsData || [];
        teamsAndChannels.value = teamsData || [];
    } catch (error) {
        console.error("Error fetching contacts/channels:", error);
        privateContacts.value = [];
        teamsAndChannels.value = [];
    }
};

const selectChat = async (item, type, teamContext = null) => {
    messages.value = [];
    pendingFile.value = null;
    activeChatContactDetails.value = null;

    if (type === 'private') {
        selectedChat.value = {
            id: null,
            name: item.username,
            roomType: 'private',
            recipientId: item.id,
            teamId: null,
            avatar: item.avatar
        };
        try {
            const roomData = await apiService.getOrCreatePrivateChatRoom(item.id);
            selectedChat.value.id = roomData.chat_id;
            if (socket.connected) {
                console.log("Chat.vue: Joining private chat room:", selectedChat.value.id);
                socket.emit('joinAllRooms', [selectedChat.value.id]); // Se une a la sala privada específica
                socket.emit("loadMessages", { room: selectedChat.value.id, roomType: 'private' });
            } else {
                console.warn("Socket not connected when trying to select private chat.");
            }
        } catch (err) {
            console.error("Error selecting private chat:", err);
        }
    } else if (type === 'channel') {
        selectedChat.value = {
            id: item.id,
            name: `#${item.channel_name}`,
            roomType: 'channel',
            teamId: teamContext ? teamContext.id : null,
            channelName: item.channel_name,
            recipientId: null,
            avatar: teamContext ? teamContext.image : null
        };
        if (socket.connected) {
            // Las salas de canal de equipo ya se unieron en onMounted.
            // Si cambias esa lógica, necesitarías unirte aquí: socket.emit('joinAllRooms', [selectedChat.value.id]);
            console.log("Chat.vue: Loading messages for team channel:", selectedChat.value.id);
            socket.emit("loadMessages", { room: selectedChat.value.id, roomType: 'channel' });
        } else {
            console.warn("Socket not connected when trying to select team channel.");
        }
    }
    newMessage.value = '';
};

const sendMessage = () => {
    const messageText = newMessage.value.trim();
    const fileToSend = pendingFile.value;

    if (!messageText && !fileToSend) return;
    if (!selectedChat.value.id && selectedChat.value.roomType !== 'private') {
        console.error("No chat selected or room ID missing");
        return;
    }
    if (selectedChat.value.roomType === 'private' && !selectedChat.value.id) {
        console.error("Private chat room ID not available. Cannot send message.");
        return;
    }
    if (!socket.connected) {
        alert("No estás conectado al servidor de chat. Intenta recargar la página o verifica tu conexión.");
        return;
    }

    const messageData = {
        message: messageText,
        sender_id: currentUser.value.id,
        roomType: selectedChat.value.roomType,
        file_info: fileToSend,
        is_encryption_requested_by_client: isEncryptionGloballyEnabled.value,
    };

    if (selectedChat.value.roomType === 'private') {
        messageData.receiver_id = selectedChat.value.recipientId;
        messageData.room = selectedChat.value.id;
    } else if (selectedChat.value.roomType === 'channel') {
        messageData.room = selectedChat.value.id;
        messageData.team_id = selectedChat.value.teamId;
        messageData.channel_name = selectedChat.value.channelName;
    }

    console.log("Chat.vue: Emitting sendMessage event", messageData); // Log para depurar
    socket.emit("sendMessage", messageData);
    newMessage.value = '';
    pendingFile.value = null;
};

const handleEnterKey = (event) => {
    if (event.shiftKey) {
        return;
    }
    sendMessage();
};

const handleFileUpload = (fileInfoFromEvent) => {
    console.log("Chat.vue: handleFileUpload received from button:", fileInfoFromEvent);
    pendingFile.value = {
        url: fileInfoFromEvent.url,
        type: fileInfoFromEvent.type,
        original_filename: fileInfoFromEvent.original_filename,
        bytes: fileInfoFromEvent.bytes,
        public_id: fileInfoFromEvent.public_id,
        name: fileInfoFromEvent.name || fileInfoFromEvent.original_filename,
        size: fileInfoFromEvent.size || fileInfoFromEvent.bytes
    };
    console.log("Chat.vue: Set pendingFile.value to:", pendingFile.value);
    if (!newMessage.value.trim()) {
        sendMessage();
    }
};

const handleUploadError = (error) => console.error("Chat.vue: Upload error in chat:", error);

// --- Helpers de Archivos ---
const getFileIcon = (fileType) => {
    if (!fileType) return 'pi pi-file';
    if (fileType.startsWith('image') || fileType === 'image') return 'pi pi-image';
    if (fileType.startsWith('video') || fileType === 'video') return 'pi pi-video';
    if (fileType === 'application/pdf' || fileType === 'pdf') return 'pi pi-file-pdf';
    if (fileType.startsWith('audio')) return 'pi pi-volume-up';
    return 'pi pi-file';
};
const isImage = (fileType) => fileType && (fileType.startsWith('image') || fileType === 'image');
const isVideo = (fileType) => fileType && (fileType.startsWith('video') || fileType === 'video');
const isAudio = (fileType) => fileType && fileType.startsWith('audio');
const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
const openImageModal = (url) => {
    modalImageUrl.value = url;
    isImageModalVisible.value = true;
};

// Add new refs for call handling
const isInCall = ref(false);
const isCallActive = ref(false);
const isCallIncoming = ref(false);
const currentCall = ref(null);
const localStream = ref(null);
const remoteStream = ref(null);
const peerConnection = ref(null);
const callDialogVisible = ref(false);
const localVideoRef = ref(null);
const remoteVideoRef = ref(null);
const callStatus = ref('');

// Add PeerJS related refs
const peer = ref(null);
const myPeerId = ref(null);
const call = ref(null);

// Initialize PeerJS
const initializePeer = () => {
    // Use the current user's ID as the peer ID for consistent connections
    const peerId = `user-${currentUser.value.id}`;
    myPeerId.value = peerId;
    
    // Create PeerJS instance with more reliable configuration
    peer.value = new Peer(peerId, {
        host: '0.peerjs.com',
        secure: true,
        port: 443,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        },
        debug: 2,
        reconnectTimer: 2000,
        maxRetries: 5
    });

    peer.value.on('open', (id) => {
        console.log('My peer ID is:', id);
        // Join socket room with peer ID
        socket.emit('join-peer-room', id);
    });

    peer.value.on('error', (err) => {
        console.error('PeerJS error:', err);
        if (err.type === 'peer-unavailable') {
            console.log('Peer is unavailable, will retry connection...');
        } else if (err.type === 'network') {
            console.log('Network error, attempting to reconnect...');
            // Attempt to reconnect
            setTimeout(() => {
                if (peer.value && !peer.value.disconnected) {
                    peer.value.reconnect();
                }
            }, 2000);
        } else {
            alert('Error in peer connection: ' + err.message);
        }
    });

    peer.value.on('disconnected', () => {
        console.log('Disconnected from PeerJS server, attempting to reconnect...');
        if (peer.value && !peer.value.destroyed) {
            peer.value.reconnect();
        }
    });

    peer.value.on('close', () => {
        console.log('Connection to PeerJS server closed');
        // Attempt to reconnect if not destroyed
        if (peer.value && !peer.value.destroyed) {
            setTimeout(() => {
                peer.value.reconnect();
            }, 2000);
        }
    });

    // Handle incoming calls
    peer.value.on('call', async (incomingCall) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            if (!peer.value || peer.value.destroyed) {
                throw new Error('Peer connection lost');
            }

            if (localVideoRef.value) {
                localVideoRef.value.srcObject = stream;
            }

            // Store the call reference
            call.value = incomingCall;
            
            // Show incoming call dialog
            isCallIncoming.value = true;
            callDialogVisible.value = true;
            callStatus.value = 'Incoming call...';

            // Store the caller's ID
            currentCall.value = {
                from: incomingCall.peer,
                callId: incomingCall.metadata?.callId
            };

            // Answer the call with our stream
            incomingCall.answer(stream);

            // Handle the remote stream
            incomingCall.on('stream', (remoteStream) => {
                if (!peer.value || peer.value.destroyed) {
                    throw new Error('Peer connection lost');
                }
                remoteStream.value = remoteStream;
                if (remoteVideoRef.value) {
                    remoteVideoRef.value.srcObject = remoteStream;
                }
                isCallActive.value = true;
                callStatus.value = 'Connected';
            });

            // Handle call end
            incomingCall.on('close', () => {
                endCall();
            });

        } catch (error) {
            console.error('Error handling incoming call:', error);
            alert('Error accessing camera/microphone or connection lost. Please check permissions and try again.');
            rejectCall();
        }
    });
};

// Modify startCall to use the recipient's ID
const startCall = async () => {
    if (!selectedChat.value.recipientId || !peer.value) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        
        if (localVideoRef.value) {
            localVideoRef.value.srcObject = stream;
        }

        // Generate a call ID
        const callId = 'call-' + Math.random().toString(36).substr(2, 9);

        // Make the call using the recipient's user ID
        const recipientPeerId = `user-${selectedChat.value.recipientId}`;
        console.log('Attempting to call peer:', recipientPeerId);
        
        call.value = peer.value.call(recipientPeerId, stream, {
            metadata: { callId }
        });

        // Handle the remote stream
        call.value.on('stream', (remoteStream) => {
            remoteStream.value = remoteStream;
            if (remoteVideoRef.value) {
                remoteVideoRef.value.srcObject = remoteStream;
            }
            isCallActive.value = true;
            callStatus.value = 'Connected';
        });

        // Handle call end
        call.value.on('close', () => {
            endCall();
        });

        isInCall.value = true;
        callDialogVisible.value = true;
        callStatus.value = 'Calling...';

        // Notify the server about the call
        socket.emit('call-user', {
            userToCall: selectedChat.value.recipientId,
            from: currentUser.value.id,
            name: currentUser.value.username,
            callId
        });

    } catch (error) {
        console.error('Error starting call:', error);
        alert('Error accessing camera/microphone or connecting to peer. Please check permissions and try again.');
    }
};

const handleIncomingCall = async (data) => {
    isCallIncoming.value = true;
    currentCall.value = data;
    callDialogVisible.value = true;
    callStatus.value = 'Incoming call...';
};

const answerCall = async () => {
    // The call is already being handled in the peer.on('call') event
    // This method is kept for UI consistency
    isCallIncoming.value = false;
};

const rejectCall = () => {
    if (call.value) {
        call.value.close();
    }
    if (currentCall.value) {
        socket.emit('reject-call', {
            to: currentCall.value.from,
            callId: currentCall.value.callId
        });
    }
    endCall();
};

const endCall = () => {
    if (call.value) {
        call.value.close();
        call.value = null;
    }
    
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
        localStream.value = null;
    }
    
    if (remoteStream.value) {
        remoteStream.value.getTracks().forEach(track => track.stop());
        remoteStream.value = null;
    }

    if (currentCall.value) {
        socket.emit('end-call', {
            callId: currentCall.value.callId,
            to: isCallIncoming.value ? currentCall.value.from : selectedChat.value.recipientId
        });
    }

    isInCall.value = false;
    isCallActive.value = false;
    isCallIncoming.value = false;
    currentCall.value = null;
    callDialogVisible.value = false;
    callStatus.value = '';
};

</script>

<style scoped>
.sidebar,
.messages {
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #374151;
        /* bg-gray-700 */
    }

    &::-webkit-scrollbar-thumb {
        background: #6b7280;
        /* bg-gray-500 */
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
        /* bg-gray-400 */
    }
}

.sidebar {
    background-color: #1f2937;
    /* bg-gray-800 slightly darker */
}

.chat-area {
    background-color: #374151;
    /* bg-gray-700 */
}

.chat-header {
    background-color: #1f2937;
    border-bottom-color: #4b5563;
}

.message-input {
    background-color: #1f2937;
    border-top-color: #4b5563;
}

.message-item .whitespace-pre-wrap {
    /* Ensures newlines in messages are respected */
    white-space: pre-wrap;
}

/* PrimeVue Textarea autoresize height adjustment */
:deep(.p-inputtextarea-resizable) {
    max-height: 150px;
    /* Or your preferred max height */
    overflow-y: auto !important;
}
</style>