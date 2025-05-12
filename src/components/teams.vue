<script setup lang="ts">
import { ref, onMounted } from "vue";
import Chat from "@/components/chat.vue";

const equipos = ref<{ nombre: string; urlImagen: string }[]>([]);

onMounted(() => {
    // Simulamos la obtención de datos (antes en localStorage o Pinia)
    equipos.value = [
        { nombre: "Equipo A", urlImagen: "https://i.pinimg.com/474x/d0/84/9e/d0849ef8583ee3d834542b5d02832bab.jpg" },
        { nombre: "Equipo B", urlImagen: "https://i.pinimg.com/474x/a6/4c/23/a64c2327f410f1f91abff4db7ef4e555.jpg" },
        { nombre: "Equipo C", urlImagen: "https://i.pinimg.com/474x/d0/84/9e/d0849ef8583ee3d834542b5d02832bab.jpg" },
        { nombre: "Equipo D", urlImagen: "https://i.pinimg.com/474x/a6/4c/23/a64c2327f410f1f91abff4db7ef4e555.jpg" },
        { nombre: "Equipo E", urlImagen: "https://i.pinimg.com/474x/d0/84/9e/d0849ef8583ee3d834542b5d02832bab.jpg" },
        { nombre: "Equipo F", urlImagen: "https://i.pinimg.com/474x/a6/4c/23/a64c2327f410f1f91abff4db7ef4e555.jpg" },
    ];
});

const showCreateTeam = ref(false);

const selectedCountries = ref();
const countries = ref([
    { name: 'Contacto 1', code: 'AU', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 2', code: 'BR', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 3', code: 'CN', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 4', code: 'EG', avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
]);

const showGrupalChat = ref(false);
const showLlamada = ref(false);
const call = ref(false);
</script>

<template>
    <div class="bg-[#04293C] text-[#b1a7d3] flex items-center 
    justify-between h-16 px-5 mb-4">
        <span class=" text-xl font-bold ">
            <i class="pi pi-users"></i>
            Equipos
        </span>
        <Button label="Crear nuevo equipo" size="small" @click="showCreateTeam = true" class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 
        rounded-full hover:bg-[#9F86F9] hover:text-white" />
    </div>

    <div class="team-grid">
        <div v-for="equipo in equipos" :key="equipo.nombre" class="team-card">
            <img :src="equipo.urlImagen" alt="Equipo" class="team-image" />
            <p class="team-name">{{ equipo.nombre }}</p>
            <div class="team-actions">
                <Button icon="pi pi-bookmark" severity="secondary" variant="text" rounded aria-label="Bookmark"
                    class="action-button" />
                <Button icon="pi pi-phone" severity="secondary" variant="text" rounded aria-label="Bookmark"
                    class="action-button" @click="showLlamada = true" />
                <Dialog v-model:visible="showLlamada" class="custom-dialog"
                    :style="{ left: '4rem', backgroundColor: '#04293C' }">
                    <template #header>
                        <span class="dialog-header">
                            <i class="pi pi-comments"></i>
                            Llamada grupal
                        </span>
                    </template>
                    <div class="call-container">
                        <span> Comenzar llamada </span>
                        <Button icon="pi pi-phone" rounded aria-label="Responder" @click="call = true" />
                        <Button icon="pi pi-times" severity="secondary" rounded aria-label="Bookmark"
                            class="cancel-button" />
                    </div>
                </Dialog>
                <Button icon="pi pi-comments" severity="secondary" variant="text" rounded aria-label="Bookmark"
                    @click="showGrupalChat = true" class="action-button" />
            </div>
            <Dialog v-model:visible="showGrupalChat" maximizable class="custom-dialog"
                :style="{ left: '4rem', backgroundColor: '#04293C' }">
                <template #header>
                    <span class="dialog-header">
                        <i class="pi pi-comments"></i>
                        Grupo x
                    </span>
                </template>
                <Chat></Chat>
            </Dialog>

            <Dialog v-model:visible="call" header="Edit Profile"
                :style="{ width: '90rem', height: '50rem', backgroundColor: '#04293C' }">
                <template #header>
                    <div class="inline-flex items-center justify-center gap-2">
                        <span class="dialog-header-calls">Titulo de la llamada</span>
                        <Button icon="pi pi-comment" severity="secondary" variant="text" rounded aria-label="Bookmark"
                            class="action-button" />
                        <Button icon="pi pi-microphone" severity="secondary" variant="text" rounded
                            aria-label="Bookmark" class="action-button" />
                        <Button icon="pi pi-camera" severity="secondary" variant="text" rounded aria-label="Bookmark"
                            class="action-button" />
                        <Button icon="pi pi-headphones" severity="secondary" variant="text" rounded
                            aria-label="Bookmark" class="action-button" />
                        <Button icon="pi pi-phone" severity="secondary" variant="text" rounded aria-label="Bookmark"
                            class="cancel-button-phone" />
                    </div>
                </template>
                <div>
                    <div class="waiting-container">
                        <span> En espera </span>
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                    </div>
                </div>
                <div>
                    <Drawer v-model:visible="visibleRight" header="Right Drawer" position="right">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                            ut aliquip
                            ex ea commodo consequat.</p>
                    </Drawer>
                </div>

            </Dialog>

        </div>
    </div>

    <Dialog v-model:visible="showCreateTeam" class="create-team-dialog"
        :style="{ left: '4rem', backgroundColor: '#04293C', border: 'none' }">
        <template #header>
            <span class="header-title">
                <i class="pi pi-users"></i>
                Nuevo equipo
            </span>
        </template>
        <span class="dialog-description">Describe a tu equipo</span>
        <div class="input-group">
            <label for="username" class="input-label">Titulo</label>
            <InputText id="username" class="input-field" autocomplete="off" />
        </div>
        <div class="input-group">
            <label for="email" class="input-label">Descripcion</label>
            <InputText id="email" class="input-field" autocomplete="off" />
        </div>
        <div class="input-group">
            <label for="email" class="input-label">Integrantes</label>
            <MultiSelect v-model="selectedCountries" :options="countries" optionLabel="name" filter
                placeholder="Selecciona los integrantes" display="chip" class="multi-select">
                <template #option="slotProps">
                    <div class="multi-select-option">
                        <img :alt="slotProps.option.name"
                            src="https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg"
                            :class="`flag flag-${slotProps.option.code.toLowerCase()} mr-2`" />
                        <div>{{ slotProps.option.name }}</div>
                    </div>
                </template>
                <template #dropdownicon>
                    <i class="pi pi-users" />
                </template>
                <template #filtericon>
                    <i class="pi pi-user" />
                </template>
                <template #header>
                    <div class="multi-select-header">Available Countries</div>
                </template>
                <template #footer>
                    <div class="multi-select-footer">
                        <Button label="Add New" severity="secondary" text size="small" icon="pi pi-plus" />
                        <Button label="Remove All" severity="danger" text size="small" icon="pi pi-times" />
                    </div>
                </template>
            </MultiSelect>
        </div>
        <div class="dialog-actions">
            <Button type="button" class="cancel-button" label="Cancelar" severity="secondary"
                @click="visible = false"></Button>
            <Button type="button" class="create-button" label="Crear" @click="visible = false"></Button>
        </div>
    </Dialog>
</template>

<style scoped>

.waiting-container {
    display: flex;
    flex-direction: column;  
    align-items: center;     
    justify-content: center; 
    background-color: #000000; 
    color: white;            
    height: 100vh;           
    width: 100%;             
    text-align: center;      
}

.waiting-container i {
    font-size: 3rem;         
    margin-bottom: 1rem;     
}

.waiting-container span {
    font-size: 1.5rem;       
    font-weight: bold;       
}


.inline-flex-center {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
}


.header-dialog {
    color: #010F16
}

.dialog-header {
    color: #9F86F9;
}

.dialog-header-calls {
    padding: auto;
    margin: 0px 50px;
    color: #e8e7eb;
}

.call-container {
    bottom: 1.5rem;
    right: 1.5rem;
    background-color: #04333c;
    color: #bfc0c0;
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.call-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.custom-dialog {
    border: 2px solid #129E82 !important;
    background-color: #003b2f;
    border: 2px solid #063611;
}


.header {
    display: flex;
    background-color: #04293C;
    
    height: 4rem;
    
    width: 100%;
    padding: 0 1.25rem;
    
    justify-content: space-between;
    align-items: center;
}

.header-title {
    display: flex;
    gap: 1.25rem;
    
    font-weight: 500;
    
    font-size: 1.5rem;
    
    color: #9F86F9;
    
    align-items: center;
}

.create-team-button {
    border-radius: 9999px;
    background-color: transparent;
    color: #9F86F9;
    
    border: 1px solid #9F86F9;
    
}

.create-team-button:hover {
    background-color: #9F86F9;
    
    color: white;
}


.team-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    
    gap: 1.5rem;
    
    padding: 1.5rem;
    
}

@media (min-width: 768px) {
    .team-grid {
        grid-template-columns: repeat(3, 1fr);
        
    }
}

@media (min-width: 1024px) {
    .team-grid {
        grid-template-columns: repeat(4, 1fr);
        
    }
}

.team-card {
    background-color: #04293C;
    
    border-radius: 0.5rem;
    
    padding: 1rem;
    
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    text-align: center;
}

.team-image {
    width: 100%;
    height: 10rem;
    
    object-fit: cover;
    border-radius: 0.5rem;
    
}

.team-name {
    color: white;
    margin-top: 0.5rem;
    
}

.team-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    
    margin-top: 0.75rem;
    
}

.action-button {
    color: #129E82;
    
}

.action-button:hover {
    background-color: transparent;
    color: #044134;
    
}


.create-team-dialog {
    background-color: #1B2A1D;
    
    border: 1px solid #129E82;
    
}

.dialog-description {
    color: #B0B0B0;
    
    margin-bottom: 2rem;
   
}

.input-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    margin-bottom: 1rem;
   
}

.input-label {
    font-weight: 600;
    
    width: 6rem;
    
    color: rgb(224, 224, 227)
}

.input-field {
    flex: 1;
    border-radius: 9999px;
    background-color: rgb(224, 224, 227);
    border: none;
    color: black;
}


.multi-select {
    width: 100%;
    max-width: 20rem;
    
    background-color: rgb(227, 227, 227);
    
    border: none;
    border-radius: 9999px;
    
}

.multi-select-header {
    font-weight: 500;
    padding: 0.5rem 1rem;
    
}

.multi-select-footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
   
    border: none;
}

.multi-select-option {
    display: flex;
    align-items: center;
}

.multi-select-option img {
    width: 1.125rem;
    
    margin-right: 0.5rem;
   
}


.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
   
}

.cancel-button {
    border-radius: 9999px;
    
    border: 1px solid #E74C3C;
   
    color: #E74C3C;
 
    background-color: transparent;
}

.cancel-button-phone {
    border-radius: 9999px;
    
    border: none;
   
    color: #E74C3C;
   
    background-color: transparent;
}

.cancel-button-phone:hover {
    color: #4f140d;
}

.cancel-button:hover {
    background-color: #E74C3C;
   
    color: white;
}

.create-button {
    border-radius: 9999px;
   
}
</style>
