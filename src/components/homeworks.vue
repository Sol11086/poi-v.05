<script setup>
import { ref } from "vue";
import 'primeicons/primeicons.css'

const showCreateHomework = ref(false);

</script>

<template>
    <div class="flex bg-matrichBlue h-16 w-full p-0 items-center justify-between px-5">
      <span class="flex gap-5 font-medium text-2xl text-lavander items-center">
          <i class="pi pi-inbox"></i>
          Tareas
      </span>
      <Button label="Crear nueva tarea" @click="showCreateHomework = true"
      class="rounded-full bg-transparent text-lavander border-lavander hover:bg-lavander hover:text-white" />
    </div>
        <div class="p-5">
            <Panel toggleable class="bg-darkJunge border-none mb-10">
                <template #header>
                    <div class="flex items-center gap-2">
                        <span class="font-bold dark:text-surface-400">Titulo tarea 1</span>
                    </div>
                </template>
                <template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex gap-5">
                            <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" 
                            :maxFileSize="1000000" @upload="onUpload" :auto="true" chooseLabel="Agregar archivo" class="rounded-full" />
                            <Button label="Entregar tarea" class="rounded-full"/>
                        </div>
                    </div>
                </template>
                <template #icons>
                    <span class="text-surface-500 dark:text-surface-400 mr-7">Updated 2 hours ago</span>
                    <Tag class="bg-lavander rounded-full mr-7">
                        <div class="flex items-center gap-2 px-1">
                            <span class="text-darkJunge">Pendiente</span>
                        </div>
                    </Tag>
                </template>
                <p class="font-medium dark:text-surface-400 ">
                    Descripcion de la tarea:
                </p>
                <p class="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </Panel>
            <Panel toggleable class="bg-darkJunge border-none mb-10">
                <template #header>
                    <div class="flex items-center gap-2">
                        <span class="font-bold dark:text-surface-400">Titulo tarea 1</span>
                    </div>
                </template>
                <template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex gap-5">
                            <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" 
                            :maxFileSize="1000000" @upload="onUpload" :auto="true" chooseLabel="Agregar archivo" class="rounded-full" />
                            <Button label="Entregar tarea" class="rounded-full"/>
                        </div>
                    </div>
                </template>
                <template #icons>
                    <span class="text-surface-500 dark:text-surface-400 mr-7">Updated 2 hours ago</span>
                    <Tag class="bg-lavander rounded-full mr-7">
                        <div class="flex items-center gap-2 px-1">
                            <span class="text-darkJunge">Pendiente</span>
                        </div>
                    </Tag>
                </template>
                <p class="font-medium dark:text-surface-400 ">
                    Descripcion de la tarea:
                </p>
                <p class="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </Panel>
            <Panel toggleable class="bg-darkJunge border-none mb-10">
                <template #header>
                    <div class="flex items-center gap-2">
                        <span class="font-bold dark:text-surface-400">Titulo tarea 1</span>
                    </div>
                </template>
                <template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex gap-5">
                            <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" 
                            :maxFileSize="1000000" @upload="onUpload" :auto="true" chooseLabel="Agregar archivo" class="rounded-full" />
                            <Button label="Entregar tarea" class="rounded-full"/>
                        </div>
                    </div>
                </template>
                <template #icons>
                    <span class="text-surface-500 dark:text-surface-400 mr-7">Updated 2 hours ago</span>
                    <Tag class="bg-lavander rounded-full mr-7">
                        <div class="flex items-center gap-2 px-1">
                            <span class="text-darkJunge">Pendiente</span>
                        </div>
                    </Tag>
                </template>
                <p class="font-medium dark:text-surface-400 ">
                    Descripcion de la tarea:
                </p>
                <p class="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </Panel>
            <Panel toggleable class="bg-darkJunge border-none mb-10">
                <template #header>
                    <div class="flex items-center gap-2">
                        <span class="font-bold dark:text-surface-400">Titulo tarea 1</span>
                    </div>
                </template>
                <template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex gap-5">
                            <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" 
                            :maxFileSize="1000000" @upload="onUpload" :auto="true" chooseLabel="Agregar archivo" class="rounded-full" />
                            <Button label="Entregar tarea" class="rounded-full"/>
                        </div>
                    </div>
                </template>
                <template #icons>
                    <span class="text-surface-500 dark:text-surface-400 mr-7">Updated 2 hours ago</span>
                    <Tag class="bg-lavander rounded-full mr-7">
                        <div class="flex items-center gap-2 px-1">
                            <span class="text-darkJunge">Pendiente</span>
                        </div>
                    </Tag>
                </template>
                <p class="font-medium dark:text-surface-400 ">
                    Descripcion de la tarea:
                </p>
                <p class="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </Panel>
            <Panel toggleable class="bg-darkJunge border-none mb-10">
                <template #header>
                    <div class="flex items-center gap-2">
                        <span class="font-bold dark:text-surface-400">Titulo tarea 1</span>
                    </div>
                </template>
                <template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex gap-5">
                            <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" 
                            :maxFileSize="1000000" @upload="onUpload" :auto="true" chooseLabel="Agregar archivo" class="rounded-full" />
                            <Button label="Entregar tarea" class="rounded-full"/>
                        </div>
                    </div>
                </template>
                <template #icons>
                    <span class="text-surface-500 dark:text-surface-400 mr-7">Updated 2 hours ago</span>
                    <Tag class="bg-lavander rounded-full mr-7">
                        <div class="flex items-center gap-2 px-1">
                            <span class="text-darkJunge">Pendiente</span>
                        </div>
                    </Tag>
                </template>
                <p class="font-medium dark:text-surface-400 ">
                    Descripcion de la tarea:
                </p>
                <p class="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </Panel>
            <Panel toggleable class="bg-darkJunge border-none mb-10">
                <template #header>
                    <div class="flex items-center gap-2">
                        <span class="font-bold dark:text-surface-400">Titulo tarea 1</span>
                    </div>
                </template>
                <template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex gap-5">
                            <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" 
                            :maxFileSize="1000000" @upload="onUpload" :auto="true" chooseLabel="Agregar archivo" class="rounded-full" />
                            <Button label="Entregar tarea" class="rounded-full"/>
                        </div>
                    </div>
                </template>
                <template #icons>
                    <span class="text-surface-500 dark:text-surface-400 mr-7">Updated 2 hours ago</span>
                    <Tag class="bg-lavander rounded-full mr-7">
                        <div class="flex items-center gap-2 px-1">
                            <span class="text-darkJunge">Pendiente</span>
                        </div>
                    </Tag>
                </template>
                <p class="font-medium dark:text-surface-400 ">
                    Descripcion de la tarea:
                </p>
                <p class="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </Panel>
        </div>
        <Dialog v-model:visible="showCreateHomework" class="bg-darkGreen border-pomonaGreen">
            <template #header>
                    <span class="flex gap-5 font-medium text-2xl text-lavander items-center">
                    <i class="pi pi-inbox"></i>
                    Nueva tarea  
                </span>
                </template>
            <span class="text-surface-500 dark:text-surface-400 block mb-8">Describe a tu tarea</span>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-24">Titulo</label>
                <InputText id="username" class="flex-auto rounded-full bg-gunMetal border-none" autocomplete="off" />
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="email" class="font-semibold w-24">Descripcion</label>
                <InputText id="email" class="flex-auto rounded-full bg-gunMetal border-none" autocomplete="off" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button"  class="rounded-full border-error text-error bg-transparent hover:bg-error hover:text-white" label="Cancelar" severity="secondary" @click="visible = false"></Button>
                <Button type="button" class="rounded-full " label="Crear" @click="visible = false"></Button>
            </div>
        </Dialog>
</template>

<style scoped>
</style>
