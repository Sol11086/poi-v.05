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
    <div class="chat-container">
        <div class="sidebar">
            <h2 class="sidebar-title">Contacts</h2>
            <ul class="user-list">
                <li v-for="user in users" :key="user.id" @click="selectUser(user)" class="user-item">
                    <img :src="user.avatar" class="user-avatar" />
                    <span>{{ user.name }}</span>
                </li>
            </ul>
        </div>

        <!-- Área del chat -->
        <div class="chat-area">
            <!-- Header del chat -->
            <div v-if="selectedUser" class="chat-header">
                <img :src="selectedUser.avatar" class="chat-header-avatar" />
                <div>
                    <h2 class="chat-header-title">{{ selectedUser.name }}</h2>
                    <p class="chat-header-status">En línea</p>
                </div>
            </div>

            <!-- Mensajes -->
            <div class="message-container">
                <div v-for="message in messages" :key="message.id" :class="{ 'text-right': message.sender === 'me' }"
                    class="message-item">
                    <p class="message-text" :class="message.sender === 'me' ? 'message-sent' : 'message-received'">
                        {{ message.text }}
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
</template>

<style scoped>
.chat-container {
    display: flex;
    height: 24rem;
    /* 96rem en Tailwind */
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
    /* Color hover similar a bg-gray-800 */
}

.user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    margin-right: 0.75rem;
    /* gap-3 */
}

.chat-area {
    width: 75%;
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
    max-height: 24rem;
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
