<script setup>
import { ref } from "vue";
import 'primeicons/primeicons.css'

const showCreateHomework = ref(false);

</script>

<template>
    <div class="bg-[#04293C] text-[#b1a7d3] flex items-center 
    justify-between h-16 px-5 mb-4">
        <span class=" text-xl font-bold ">
            <i class="pi pi-inbox"></i>
            Tareas
        </span>
        <Button label="Crear nueva tarea" size="small" @click="showCreateHomework = true" class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 
        rounded-full hover:bg-[#9F86F9] hover:text-white" />
    </div>

    <div class="p-4 mb-4">
        <Panel toggleable class="bg-[#121C22] p-4">
            <template #header>
                <div>
                    <span class=" text-xl font-bold text-white">Titulo tarea 1</span>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-start gap-4">
                    <div class="flex justify-start gap-4 mt-4">
                        <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" :maxFileSize="1000000"
                            @upload="onUpload" :auto="true" chooseLabel="Agregar archivo" class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 
                        rounded-full hover:bg-[#9F86F9] hover:text-white" />
                        <Button label="Entregar tarea" class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 
                        rounded-full hover:bg-[#9F86F9] hover:text-white" />
                    </div>
                </div>
            </template>
            <template #icons >
                    <span class="mr-10">Updated 2 hours ago</span>
                    <Tag value="Pendiente" class="p-1 bg-[#9F86F9] mr-2"></Tag>
            </template>
            <p class="font-semibold text-gray-100 mt-4">
                Descripcion de la tarea:
            </p>
            <p class="text-gray-300 mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna
                aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat.
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur
                sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <br />
            <p class="text-gray-300 mt-2">
                Recompensa:
            </p>
            <br />
            <p class="task-description">
                <i class="pi pi-spin pi-star-fill" style="font-size: 2rem ; color: yellowgreen "></i>
            </p>
        </Panel>
    </div>

    <Dialog v-model:visible="showCreateHomework" class="custom-dialog"
        :style="{ left: '4rem', backgroundColor: '#04293C' }">
        <template #header>
            <span class="dialog-header">
                <i class="pi pi-inbox"></i>
                Nueva tarea
            </span>
        </template>
        <span class="dialog-subtitle">Describe a tu tarea</span>
        <div class="form-group">
            <label for="username" class="form-label">Titulo</label>
            <InputText id="username" class="form-input" autocomplete="off" />
        </div>
        <div class="form-group">
            <label for="email" class="form-label">Descripcion</label>
            <InputText id="email" class="form-input" autocomplete="off" />
        </div>
        <div class="dialog-actions">
            <Button type="button" class="dialog-cancel" label="Cancelar" severity="secondary"
                @click="visible = false"></Button>
            <Button type="button" class="dialog-create" label="Crear" @click="visible = false"></Button>
        </div>
    </Dialog>
</template>

<style scoped>
/* Custom Header */
/* .custom-header {
    display: flex;
    background-color: #04293C; 
    height: 4rem; 
    width: 100%;
    padding: 0;
    align-items: center;
    justify-content: space-between;
    padding-left: 1.25rem; 
    padding-right: 1.25rem; 
}

.header-title {
    display: flex;
    gap: 1.25rem; 
    font-weight: 500; 
    font-size: 1.5rem; 
    color: #b1a7d3; 
    align-items: center;
}

.custom-button {
    border-radius: 9999px; 
    background-color: transparent;
    color: #9F86F9; 
    border: 1px solid #9F86F9; 
}

.custom-button:hover {
    background-color: #9F86F9; 
    color: white;
}


.panel-container {
    padding: 1.25rem; 
}

.custom-panel {
    background-color: #121C22; 
    border: none;
    margin-bottom: 2.5rem; 
}


.panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  
}

.panel-title {
    font-weight: bold; 
    color: #e5e5e5; 
    font-size: large;
}


.panel-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem; 
}

.footer-actions {
    display: flex;
    gap: 1.25rem; 
}

.file-upload {
    border-radius: 9999px; 
}

.task-button {
    border-radius: 9999px; 
}


.task-info {
    color: #9F86F9;
    margin-right: 1.75rem; 
}

.task-tag {
    background-color: #9F86F9; 
    border-radius: 9999px; 
    margin-right: 1.75rem; 
}

.tag-content {
    display: flex;
    align-items: center;
    gap: 0.5rem; 
    padding-left: 0.25rem; 
}

.task-status {
    color: #303030; 
}


.task-description {
    font-weight: 500; 
    color: #757575; 
}

.task-detail {
    margin-top: 0.5rem;
    color: rgb(232, 238, 237)
}


.custom-dialog {
    border: 2px solid #129E82 !important;
    background-color: #003b2f; 
    border: 2px solid #063611; 
}

.dialog-header {
    display: flex;
    gap: 1.25rem; 
    font-weight: 500; 
    font-size: 1.5rem; 
    color: #9F86F9; 
    align-items: center;
}

.dialog-subtitle {
    color: #757575; 
}

.form-group {
    display: flex;
    align-items: center;
    gap: 1rem; 
    margin-bottom: 1rem; 
}

.form-label {
    font-weight: 600; 
    width: 6rem; 
}

.form-input {
    flex-grow: 1; 
    border-radius: 9999px;
    background-color: #2e3a59; 
    border: none;
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem; 
}

.dialog-cancel {
    border-color: #e74c3c; 
    color: #e74c3c; 
    background-color: transparent;
    border-radius: 9999px;
}

.dialog-cancel:hover {
    background-color: #e74c3c; 
    color: white;
}

.dialog-create {
    border-radius: 9999px; 
} */
</style>
