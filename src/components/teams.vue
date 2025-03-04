<script setup lang="ts">
import { ref, onMounted } from "vue";

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
    { name: 'Contacto 1', code: 'AU' , avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 2', code: 'BR' , avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 3', code: 'CN' , avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
    { name: 'Contacto 4', code: 'EG' , avatar: 'https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg' },
]);
</script>

<template>
    <div class="header">
    <span class="header-title">
        <i class="pi pi-users"></i>
        Equipos
    </span>
    <Button label="Crear nuevo equipo" @click="showCreateTeam = true" class="create-team-button" />
</div>

<div class="team-grid">
    <div 
        v-for="equipo in equipos" 
        :key="equipo.nombre" 
        class="team-card"
    >
        <img :src="equipo.urlImagen" alt="Equipo" class="team-image" />
        <p class="team-name">{{ equipo.nombre }}</p>
        <div class="team-actions">
            <Button icon="pi pi-bookmark" severity="secondary" variant="text" rounded aria-label="Bookmark" class="action-button" />
            <Button icon="pi pi-phone" severity="secondary" variant="text" rounded aria-label="Bookmark" class="action-button" />
            <Button icon="pi pi-book" severity="secondary" variant="text" rounded aria-label="Bookmark" class="action-button" />
        </div>
    </div>
</div>

<Dialog v-model:visible="showCreateTeam" class="create-team-dialog">
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
        <MultiSelect v-model="selectedCountries" 
            :options="countries" optionLabel="name" 
            filter placeholder="Selecciona los integrantes" 
            display="chip" class="multi-select">
            <template #option="slotProps">
                <div class="multi-select-option">
                    <img :alt="slotProps.option.name" src="https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg" :class="`flag flag-${slotProps.option.code.toLowerCase()} mr-2`" />
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
        <Button type="button"  class="cancel-button" label="Cancelar" severity="secondary" @click="visible = false"></Button>
        <Button type="button" class="create-button" label="Crear" @click="visible = false"></Button>
    </div>
</Dialog>

</template>

<style scoped>
/* Header */
.header {
    display: flex;
    background-color: #04293C; /* Matrích Blue */
    height: 4rem; /* 16 in Tailwind */
    width: 100%;
    padding: 0 1.25rem; /* px-5 */
    justify-content: space-between;
    align-items: center;
}

.header-title {
    display: flex;
    gap: 1.25rem; /* gap-5 */
    font-weight: 500; /* font-medium */
    font-size: 1.5rem; /* text-2xl */
    color: #B8A3E5; /* Lavander */
    align-items: center;
}

.create-team-button {
    border-radius: 9999px;
    background-color: transparent;
    color: #B8A3E5; /* Lavander */
    border: 1px solid #B8A3E5; /* Lavender border */
}

.create-team-button:hover {
    background-color: #B8A3E5; /* Lavander */
    color: white;
}

/* Team Grid */
.team-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* grid-cols-2 */
    gap: 1.5rem; /* gap-6 */
    padding: 1.5rem; /* p-6 */
}

@media (min-width: 768px) {
    .team-grid {
        grid-template-columns: repeat(3, 1fr); /* md:grid-cols-3 */
    }
}

@media (min-width: 1024px) {
    .team-grid {
        grid-template-columns: repeat(4, 1fr); /* lg:grid-cols-4 */
    }
}

/* Team Card */
.team-card {
    background-color: #04293C; /* bg-gray-800 */
    border-radius: 0.5rem; /* rounded-lg */
    padding: 1rem; /* p-4 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* shadow-md */
    text-align: center;
}

.team-image {
    width: 100%;
    height: 10rem; /* h-40 */
    object-fit: cover;
    border-radius: 0.5rem; /* rounded-lg */
}

.team-name {
    color: white;
    margin-top: 0.5rem; /* mt-2 */
}

.team-actions {
    display: flex;
    justify-content: center;
    gap: 1rem; /* gap-4 */
    margin-top: 0.75rem; /* mt-3 */
}

.action-button {
    color: #129E82; /* text-primary-500 */
}

.action-button:hover {
    background-color: transparent;
    color: #044134; /* text-pomonaGreen */
}

/* Dialog */
.create-team-dialog {
    background-color: #1B2A1D; /* Dark Green */
    border: 1px solid #129E82; /* Pomona Green */
}

.dialog-description {
    color: #B0B0B0; /* text-surface-500 */
    margin-bottom: 2rem; /* mb-8 */
}

.input-group {
    display: flex;
    align-items: center;
    gap: 1rem; /* gap-4 */
    margin-bottom: 1rem; /* mb-4 */
}

.input-label {
    font-weight: 600; /* font-semibold */
    width: 6rem; /* w-24 */
}

.input-field {
    flex: 1;
    border-radius: 9999px; /* rounded-full */
    background-color: #2C3E50; /* bg-gunMetal */
    border: none;
    color: white;
}

/* MultiSelect */
.multi-select {
    width: 100%;
    max-width: 20rem; /* md:w-80 */
    background-color: #2C3E50; /* bg-gunMetal */
    border: none;
    border-radius: 9999px; /* rounded-full */
}

.multi-select-header {
    font-weight: 500;
    padding: 0.5rem 1rem; /* px-3 py-2 */
}

.multi-select-footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem; /* p-3 */
    border: none;
}

.multi-select-option {
    display: flex;
    align-items: center;
}

.multi-select-option img {
    width: 1.125rem; /* w-4 */
    margin-right: 0.5rem; /* mr-2 */
}

/* Dialog Actions */
.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem; /* gap-2 */
}

.cancel-button {
    border-radius: 9999px; /* rounded-full */
    border: 1px solid #E74C3C; /* error */
    color: #E74C3C; /* error */
    background-color: transparent;
}

.cancel-button:hover {
    background-color: #E74C3C; /* error */
    color: white;
}

.create-button {
    border-radius: 9999px; /* rounded-full */
}

</style>
