<script setup>
import { ref, onMounted } from "vue";
import 'primeicons/primeicons.css'
import Notifications from "@/components/notifications.vue";
import Chat from "@/components/chat.vue";
import Homeworks from "@/components/homeworks.vue";
import Teams from "@/components/teams.vue";
import { parseJwt } from '@/utils/jwt.js';
import UseProfile from "../components/useProfile.vue";

const visibleNotis = ref(false);
const visibleChat = ref(false);
const visibleHomework = ref(false);
const visibleTeams = ref(false);

const users = ref([
  { id: 1, name: 'Juan', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
  { id: 2, name: 'María', avatar: 'https://i.pinimg.com/474x/27/96/cb/2796cbfdd164a96a581cc272a313548b.jpg' },
]);

const selectedUser = ref(null);
const messages = ref([]);
const newMessage = ref('');

const selectUser = (user) => {
  selectedUser.value = user;
  messages.value = [];
};

const sendMessage = () => {
  if (newMessage.value.trim() === '') return;
  messages.value.push({ id: Date.now(), text: newMessage.value, sender: 'me' });
  newMessage.value = '';
};

const activeComponent = ref('teams');

function setActiveComponent(component) {
  if (activeComponent.value !== component) {
    activeComponent.value = component
  }
}

const op = ref();
const toggle = (event) => {
  op.value.toggle(event);
}

const username = ref('');

onMounted(() => {
  const token = localStorage.getItem('user_token'); // <-- usa el nombre correcto
  if (token) {
    try {
      const decoded = parseJwt(token);
      console.log("Token decodificado:", decoded);
      username.value = decoded.username || 'Usuario';
    } catch (err) {
      console.error("Token inválido:", err);
    }
  }
});

function logout() {
  localStorage.removeItem('user_token');
  localStorage.removeItem('username');
  window.location.href = "login";
}

const selectedUserProfile = ref(null)

function openUserProfile(user) {
  selectedUserProfile.value = user
  visibleChat.value = false
  activeComponent.value = 'profile'
}

const teamsKey = ref(0)
function resetView() {
  teamsKey.value++
}

</script>

<template>
  <div class="app-container">
    <Menubar class="bg-[#021F25] flex justify-between items-center px-4">
      <template #start>
        <Button label="Empresa X" variant="link" class="ml-4" />
      </template>

      <template #end>
        <div class="flex gap-4 items-center ml-auto p-4">
          <Button icon="pi pi-gift" variant="text" rounded size="small" aria-label="Filter" class="filter-button"
            @click="toggle" />
          <Popover ref="op" :style="{ left: '4rem', backgroundColor: '#010F16', border: 'none' }" class="p-5">
            <div class="flex">
              <div class="bg-[#180e3b] flex gap-2 rounded-l-full p-1 items-center justify-center">
                <i class="pi pi-star-fill text-yellow-300 ml-2"></i>
                <span class="text-white mr-2">
                  Recompensas
                </span>
              </div>
              <div class="bg-[#9F86F9] rounded-r-full flex items-center justify-center">
                <span class="text-black p-2">
                  15
                </span>
              </div>
            </div>
          </Popover>
          <InputText placeholder="Search" type="text" class="bg-[#21333D] p-2 text-white" />
          <h2 class="text-white text-base">Bienvenido, {{ username }}</h2>
          <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" />
          <Button icon="pi pi-sign-out" @click="logout()" variant="text" rounded aria-label="Logout"
            class="filter-button" />
        </div>
      </template>
    </Menubar>

    <div class="flex overflow-y-hidden h-full">
      <div class="sidebar">
        <Button icon="pi pi-bell" variant="text" size="large" @click="visibleNotis = true" rounded
          class="sidebar-button" />
        <Button icon="pi pi-users" variant="text" @click="setActiveComponent('teams')" size="large" rounded
          class="sidebar-button" />
        <Button icon="pi pi-comments" variant="text" size="large" @click="visibleChat = true" rounded
          class="sidebar-button" />
        <Button icon="pi pi-inbox" variant="text" size="large" @click="setActiveComponent('homework')" rounded
          class="sidebar-button" />
      </div>

      <div class="flex-1 bg-[#010F16] text-white max-h-[calc(100vh-Xpx)] overflow-y-auto scr ml-16 scrollbar-hide"
        style="background-image: url('/src/assets/Group 39.png'); background-repeat: no-repeat; background-position: 120% 0.5%; background-size: 700px auto; background-attachment: fixed;">
        <Teams v-if="activeComponent === 'teams'" @backToHome="resetView" :key="teamsKey" />
        <Homeworks v-if="activeComponent === 'homework'" />
        <UseProfile v-if="activeComponent === 'profile'" :user="selectedUserProfile" />
      </div>
    </div>

    <Drawer v-model:visible="visibleNotis" header="Notificaciones" class="p-4"
      :style="{ left: '4rem', backgroundColor: '#04293C', border: 'none', width: '25rem' }"
      pt:mask:class="backdrop-blur-sm">
      <template #header>
        <span class="drawer-header">
          <i class="pi pi-bell"></i>
          Notificaciones
        </span>
      </template>
      <Notifications></Notifications>
    </Drawer>
    <Dialog v-model:visible="visibleChat" maximizable class="dialog"
      :style="{ width: '50rem', height: '30rem', backgroundColor: '#04293C', padding: '1rem', border: 'none' }" :pt="{
        content: {
          class: 'h-[500px] overflow-y-auto'
        }
      }">
      <template #header>
        <span class="dialog-header">
          <i class="pi pi-comments"></i>
          Chat
        </span>
      </template>
      <Chat @view-profile="openUserProfile" />
    </Dialog>
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.menubar {
  background-color: #021F25;
  /* Dark green */
  border: none;
  border-radius: 0;
  margin: 0;
  padding: 0.5rem 1rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
}

.menubar-end {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input {
  width: 25rem;
  border-radius: 9999px;
  background-color: #21333D;
  /* Gunmetal color */
  border: none;
  color: white
}

.filter-button {
  background-color: transparent;
  color: #129E82;
  /* Pomona Green */
}

.sidebar {
  background-color: #021F25;
  width: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 0;
  position: fixed;
  top: 4rem;
  left: 0;
  height: calc(100vh - 4rem);
  z-index: 40;
}

.sidebar-button {
  margin-bottom: 2.5rem;
  background-color: transparent;
  color: #129E82;
  /* Pomona Green */
}

/*.main-content {
  flex: 1;
  background: #010F16 url('/src/assets/Group 39.png') no-repeat;
  background-position: 120% 5%;
  background-size: 700px auto;
  color: white;
  overflow: auto;
  margin-left: 4rem;
}*/

.drawer {
  width: 100%;
  max-width: 100rem;
  position: fixed;
  top: 4rem;
  right: 0;
  height: calc(100vh - 4rem);
  z-index: 50;
  background-color: #2d3748;
  border: none;
}

.drawer-header {
  display: flex;
  gap: 1.25rem;
  font-weight: 500;
  font-size: 1.25rem;
  color: #9F86F9;
  /* Lavender color */
  align-items: center;
}

.dialog {
  background-color: #04293C;
  border-color: #39b54a;
  width: 10rem;
  height: 10rem;
  padding: 4rem;
  /* Pomona Green */
}

.dialog-header {
  display: flex;
  gap: 1.25rem;
  font-weight: 500;
  font-size: 1.25rem;
  color: #e0e0e0;
  /* Lavender color */
  align-items: center;
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.scrollbar-hide::-webkit-scrollbar) {
  width: 0px;
  height: 0px;
  background: transparent;
}
</style>
