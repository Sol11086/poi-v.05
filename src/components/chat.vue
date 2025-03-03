<script setup>
import { ref } from "vue";
import 'primeicons/primeicons.css'

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
</script>

<template>
    <div class="flex h-96">
            <div class="w-16 md:w-64 bg-darkJunge text-white p-4 flex flex-col">
            <h2 class="text-lg font-semibold mb-4">Contacts</h2>
            <ul>
                <li 
                v-for="user in users" 
                :key="user.id" 
                @click="selectUser(user)"
                class="flex items-center p-2 cursor-pointer hover:bg-gray-800 rounded-lg"
                >
                <img :src="user.avatar" class="w-10 h-10 rounded-full mr-3" />
                <span>{{ user.name }}</span>
                </li>
            </ul>
            </div>
            
            <!-- Área del chat -->
            <div class="w-3/4 flex flex-col">
            <!-- Header del chat -->
            <div v-if="selectedUser" class="bg-gray-800 text-white p-4 flex items-center">
                <img :src="selectedUser.avatar" class="w-10 h-10 rounded-full mr-3" />
                <div>
                <h2 class="text-lg font-semibold">{{ selectedUser.name }}</h2>
                <p class="text-sm text-green-400">En línea</p>
                </div>
            </div>
            
            <!-- Mensajes -->
            <div class="flex-1 h-64 max-h-96 p-4 overflow-y-auto bg-black">
                <div 
                v-for="message in messages" 
                :key="message.id" 
                :class="{'text-right': message.sender === 'me'}"
                class="mb-2 rounded-full"
                >
                <p 
                    class="inline-block px-4 py-2 rounded-full" 
                    :class="message.sender === 'me' ? 'bg-primary-500 text-white' : 'bg-gray-300 text-black'"
                >
                    {{ message.text }}
                </p>
                </div>
            </div>
            
            <!-- Input de mensaje -->
            <div class="p-4 bg-gray-800 flex">
                <input 
                v-model="newMessage" 
                @keyup.enter="sendMessage" 
                placeholder="Escribe un mensaje..." 
                class="flex-1 p-2 border rounded-full bg-gunMetal border-none text-white hover:border-gray-800s"
                />
                <Button icon="pi pi-send" @click="sendMessage" 
                severity="contrast" variant="text" 
                rounded  
                class=" text-primary-500 hover:bg-transparent hover:text-pomonaGreen "/>
            </div>
        </div>
     </div>
</template>

<style scoped>
</style>
