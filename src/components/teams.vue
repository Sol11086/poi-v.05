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
    <div class="flex bg-matrichBlue h-16 w-full p-0 items-center justify-between px-5">
      <span class="flex gap-5 font-medium text-2xl text-lavander items-center">
          <i class="pi pi-users"></i>
          Equipos
      </span>
      <Button label="Crear nuevo equipo" @click="showCreateTeam = true" class="rounded-full bg-transparent text-lavander border-lavander hover:bg-lavander hover:text-white" />
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      <div 
        v-for="equipo in equipos" 
        :key="equipo.nombre" 
        class="bg-gray-800 rounded-lg p-4 shadow-md text-center"
      >
        <img :src="equipo.urlImagen" alt="Equipo" class="w-full h-40 object-cover rounded-lg p-0">
        <p class="text-white mt-2">{{ equipo.nombre }}</p>
        <div>
          <Button icon="pi pi-bookmark" severity="secondary" variant="text" rounded aria-label="Bookmark" class="text-primary-500 hover:bg-transparent hover:text-pomonaGreen" />
          <Button icon="pi pi-phone" severity="secondary" variant="text" rounded aria-label="Bookmark" class="text-primary-500 hover:bg-transparent hover:text-pomonaGreen" />
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showCreateTeam" class="bg-darkGreen border-pomonaGreen">
      <template #header>
            <span class="flex gap-5 font-medium text-2xl text-lavander items-center">
            <i class="pi pi-users"></i>
            Nuevo equipo  
        </span>
        </template>
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Describe a tu equipo</span>
    <div class="flex items-center gap-4 mb-4">
        <label for="username" class="font-semibold w-24">Titulo</label>
        <InputText id="username" class="flex-auto rounded-full bg-gunMetal border-none" autocomplete="off" />
    </div>
    <div class="flex items-center gap-4 mb-4">
        <label for="email" class="font-semibold w-24">Descripcion</label>
        <InputText id="email" class="flex-auto rounded-full bg-gunMetal border-none" autocomplete="off" />
    </div>
    <div class="flex items-center gap-4 mb-8">
        <label for="email" class="font-semibold w-24">Integrantes</label>
        <MultiSelect v-model="selectedCountries" 
        :options="countries" optionLabel="name" 
        filter placeholder="Selecciona los integrantes" 
        display="chip" class="w-full md:w-80 bg-gunMetal border-none rounded-full">
          <template #option="slotProps">
              <div class="flex items-center">
                  <img :alt="slotProps.option.name" src="https://i.pinimg.com/736x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg" :class="`flag flag-${slotProps.option.code.toLowerCase()} mr-2`" style="width: 18px" />
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
              <div class="font-medium px-3 py-2">Available Countries</div>
          </template>
          <template #footer>
              <div class="p-3 flex justify-between border-none">
                  <Button label="Add New" severity="secondary" text size="small" icon="pi pi-plus" />
                  <Button label="Remove All" severity="danger" text size="small" icon="pi pi-times" />
              </div>
          </template>
        </MultiSelect>
    </div>
    <div class="flex justify-end gap-2">
        <Button type="button"  class="rounded-full border-error text-error bg-transparent hover:bg-error hover:text-white" label="Cancelar" severity="secondary" @click="visible = false"></Button>
        <Button type="button" class="rounded-full " label="Crear" @click="visible = false"></Button>
    </div>
    </Dialog>
   
</template>

<style scoped>
</style>
