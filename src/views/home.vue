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
</script>

<template>
   <div class="h-screen flex flex-col">
    <Menubar class="bg-darkGreen border-none rounded-none m-0 p-2 fixed top-0 left-0 w-full z-50">
      <template #start>
        <Button label="Empresa X" variant="link" class="" />
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <InputText
            placeholder="Search"
            type="text"
            class="w-32 sm:w-auto rounded-full bg-gunMetal border-none"
          />
          <Button
            icon="pi pi-ellipsis-h"
            variant="text"
            rounded
            aria-label="Filter"
            class="hover:bg-transparent hover:text-pomonaGreen"
          />
          <Avatar
            image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
            shape="circle"
          />
        </div>
      </template>
    </Menubar>

    <div class="flex flex-1 pt-[4rem]">
      <div
        class="bg-darkGreen w-16 flex flex-col items-center py-5 fixed top-[4rem] left-0 h-[calc(100vh-4rem)] z-40"
      >
        <Button
          icon="pi pi-bell"
          variant="text"
          size="large"
          @click="visibleNotis = true"
          rounded
          class="hover:bg-transparent hover:text-pomonaGreen mb-10"
        />
        <Button
          icon="pi pi-users"
          variant="text"
           @click="setActiveComponent('teams')"
          size="large"
          rounded
          class="hover:bg-transparent hover:text-pomonaGreen mb-10"
        />
        <Button
          icon="pi pi-comments"
          variant="text"
          size="large"
          @click="visibleChat = true"
          rounded
          class="hover:bg-transparent hover:text-pomonaGreen mb-10"
        />
        <Button
          icon="pi pi-inbox"
          variant="text"
          size="large"
          @click="setActiveComponent('homework')"
          rounded
          class="hover:bg-transparent hover:text-pomonaGreen mb-10"
        />
      </div>

      <div class="flex-1 bg-[#010F16] text-white overflow-auto ml-16">
        <Teams v-if="activeComponent === 'teams'" />
        <Homeworks v-if="activeComponent === 'homework'" />
      </div>
    </div>

    <Drawer
      v-model:visible="visibleNotis"
      header="Notificaciones"
      class="!w-1/4 md:!w-80 lg:!w-[30rem] fixed top-[4rem] right-0 h-[calc(100vh-4rem)] z-50 bg-darkGreen border-none"
      :style="{ left: '4rem' }"
    >
    <template #header>
        <span class="flex gap-5 font-medium text-2xl text-lavander items-center">
            <i class="pi pi-bell"></i>
            Notidicaciones 
        </span>
    </template>
        <Notifications ></Notifications>
    </Drawer>
    <Dialog v-model:visible="visibleChat"  maximizable class="bg-darkGreen border-pomonaGreen">
        <template #header>
            <span class="flex gap-5 font-medium text-2xl text-lavander items-center">
            <i class="pi pi-comments"></i>
            Chat 
        </span>
        </template>
            <Chat></Chat>
    </Dialog>
  </div>
</template>

<style scoped>

</style>
