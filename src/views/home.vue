<script setup>
import { ref } from "vue";
import 'primeicons/primeicons.css'
import Notifications from "@/components/notifications.vue";
import Chat from "@/components/chat.vue";
import Homeworks from "@/components/homeworks.vue";
import Teams from "@/components/teams.vue";

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

const activeComponent = ref('home');

const setActiveComponent = (component) => {
  activeComponent.value = activeComponent.value === component ? null : component;
};

const op = ref();
const toggle = (event) => {
    op.value.toggle(event);
}


</script>

<template>
     <div class="app-container">
    <Menubar class="menubar">
      <template #start>
        <Button label="Empresa X" variant="link" class="" />
      </template>
      <template #end>
        <div class="menubar-end">
          <Button
            icon="pi pi-gift"
            variant="text"
            rounded
            size="small"
            aria-label="Filter"
            class="filter-button"
            @click="toggle"
          />
          <Popover ref="op" :style="{ left: '4rem', backgroundColor: '#04293C' , border: 'none' }" >
            <div class="flex flex-col gap-4">
                    <span style="color:aliceblue"> Recompensas </span>
                    <i class="pi pi-spin pi-star-fill" style="font-size: 1rem ; color: yellowgreen "></i>
            </div>
        </Popover>
          <InputText
            placeholder="Search"
            type="text"
            class="search-input"
          />
          <Button type="button" icon="pi pi-share-alt" label="Share" @click="toggle" />
          <Avatar
            image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
            shape="circle"
          />
          <Button
            icon="pi pi-sign-out"
            variant="text"
            rounded
            aria-label="Filter"
            class="filter-button"
          />
        </div>
      </template>
    </Menubar>

    <div class="sidebar-container">
      <div class="sidebar">
        <Button
          icon="pi pi-bell"
          variant="text"
          size="large"
          @click="visibleNotis = true"
          rounded
          class="sidebar-button"
        />
        <Button
          icon="pi pi-users"
          variant="text"
          @click="setActiveComponent('teams')"
          size="large"
          rounded
          class="sidebar-button"
        />
        <Button
          icon="pi pi-comments"
          variant="text"
          size="large"
          @click="visibleChat = true"
          rounded
          class="sidebar-button"
        />
        <Button
          icon="pi pi-inbox"
          variant="text"
          size="large"
          @click="setActiveComponent('homework')"
          rounded
          class="sidebar-button"
        />
      </div>

      <div class="main-content">
        <Teams v-if="activeComponent === 'teams'" />
        <Homeworks v-if="activeComponent === 'homework'" />
      </div>
    </div>

    <Drawer
      v-model:visible="visibleNotis"
      header="Notificaciones"
      class="drawer"
      :style="{ left: '4rem', backgroundColor: '#04293C' , border: 'none' ,  width: '25rem'}"
      pt:mask:class="backdrop-blur-sm"
    >
    <template #header>
        <span class="drawer-header">
            <i class="pi pi-bell"></i>
            Notificaciones 
        </span>
    </template>
        <Notifications></Notifications>
    </Drawer>
    <Dialog v-model:visible="visibleChat" maximizable class="dialog"  :style="{ left: '4rem', backgroundColor: '#04293C' }">
        <template #header>
            <span class="dialog-header">
            <i class="pi pi-comments"></i>
            Chat 
        </span>
        </template>
            <Chat></Chat>
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
  background-color: #021F25; /* Dark green */
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
  background-color: #21333D; /* Gunmetal color */
  border: none;
  color: white
}

.filter-button {
  background-color: transparent;
  color: #129E82; /* Pomona Green */
}

.sidebar-container {
  display: flex;
  flex: 1;
  padding-top: 4rem;
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
  color: #129E82; /* Pomona Green */
}

.main-content {
  flex: 1;
  background: #010F16 url('/src/assets/Group 39.png') no-repeat;
  background-position: 120% 5%;
  background-size: 700px auto;
  color: white;
  overflow: auto;
  margin-left: 4rem;
}

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
  color: #9F86F9; /* Lavender color */
  align-items: center;
}

.dialog {
  background-color: #04293C;
  border-color: #39b54a; /* Pomona Green */
}

.dialog-header {
  display: flex;
  gap: 1.25rem;
  font-weight: 500;
  font-size: 1.25rem;
  color: #e0e0e0; /* Lavender color */
  align-items: center;
}

</style>
