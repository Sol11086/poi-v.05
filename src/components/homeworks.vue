<script setup>
import { ref } from "vue";
import 'primeicons/primeicons.css'

const showCreateHomework = ref(false);

</script>

<template>
  <div class="custom-header">
    <span class="header-title">
        <i class="pi pi-inbox"></i>
        Tareas
    </span>
    <Button label="Crear nueva tarea" @click="showCreateHomework = true" class="custom-button" />
</div>

<div class="panel-container">
    <Panel toggleable class="custom-panel">
        <template #header>
            <div class="panel-header">
                <span class="panel-title">Titulo tarea 1</span>
            </div>
        </template>
        <template #footer>
            <div class="panel-footer">
                <div class="footer-actions">
                    <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" 
                    :maxFileSize="1000000" @upload="onUpload" :auto="true" chooseLabel="Agregar archivo" class="file-upload"/>
                    <Button label="Entregar tarea" class="task-button"/>
                </div>
            </div>
        </template>
        <template #icons>
            <span class="task-info">Updated 2 hours ago</span>
            <Tag class="task-tag">
                <div class="tag-content">
                    <span class="task-status">Pendiente</span>
                </div>
            </Tag>
        </template>
        <p class="task-description">
            Descripcion de la tarea:
        </p>
        <p class="task-detail">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
    </Panel>
</div>

<Dialog v-model:visible="showCreateHomework" class="custom-dialog">
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
        <Button type="button" class="dialog-cancel" label="Cancelar" severity="secondary" @click="visible = false"></Button>
        <Button type="button" class="dialog-create" label="Crear" @click="visible = false"></Button>
    </div>
</Dialog>
</template>

<style scoped>
/* Custom Header */
.custom-header {
    display: flex;
    background-color: #04293C; /* bg-matrichBlue */
    height: 4rem; /* h-16 */
    width: 100%;
    padding: 0;
    align-items: center;
    justify-content: space-between;
    padding-left: 1.25rem; /* px-5 */
    padding-right: 1.25rem; /* px-5 */
}

.header-title {
    display: flex;
    gap: 1.25rem; /* gap-5 */
    font-weight: 500; /* font-medium */
    font-size: 1.5rem; /* text-2xl */
    color: #b1a7d3; /* text-lavander */
    align-items: center;
}

.custom-button {
    border-radius: 9999px; /* rounded-full */
    background-color: transparent;
    color: #9F86F9; /* text-lavander */
    border: 1px solid #9F86F9; /* border-lavander */
}

.custom-button:hover {
    background-color: #9F86F9; /* hover:bg-lavander */
    color: white;
}

/* Panel Container */
.panel-container {
    padding: 1.25rem; /* p-5 */
}

.custom-panel {
    background-color: #121C22; /* bg-darkJunge */
    border: none;
    margin-bottom: 2.5rem; /* mb-10 */
}

/* Panel Header */
.panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem; /* gap-2 */
}

.panel-title {
    font-weight: bold; /* font-bold */
    color: #757575; /* dark:text-surface-400 */
}

/* Panel Footer */
.panel-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem; /* gap-4 */
}

.footer-actions {
    display: flex;
    gap: 1.25rem; /* gap-5 */
}

.file-upload {
    border-radius: 9999px; /* rounded-full */
}

.task-button {
    border-radius: 9999px; /* rounded-full */
}

/* Task Info */
.task-info {
    color: #9F86F9; /* text-surface-500 */
    margin-right: 1.75rem; /* mr-7 */
}

.task-tag {
    background-color: #9F86F9; /* bg-lavander */
    border-radius: 9999px; /* rounded-full */
    margin-right: 1.75rem; /* mr-7 */
}

.tag-content {
    display: flex;
    align-items: center;
    gap: 0.5rem; /* gap-2 */
    padding-left: 0.25rem; /* px-1 */
}

.task-status {
    color: #303030; /* text-darkJunge */
}

/* Task Description */
.task-description {
    font-weight: 500; /* font-medium */
    color: #757575; /* dark:text-surface-400 */
}

.task-detail {
    margin-top: 0.5rem; /* mt-2 */
}

/* Dialog */
.custom-dialog {
    background-color: #003b2f; /* bg-darkGreen */
    border: 1px solid #28a745; /* border-pomonaGreen */
}

.dialog-header {
    display: flex;
    gap: 1.25rem; /* gap-5 */
    font-weight: 500; /* font-medium */
    font-size: 1.5rem; /* text-2xl */
    color: #9F86F9; /* text-lavander */
    align-items: center;
}

.dialog-subtitle {
    color: #757575; /* text-surface-500 */
}

.form-group {
    display: flex;
    align-items: center;
    gap: 1rem; /* gap-4 */
    margin-bottom: 1rem; /* mb-4 */
}

.form-label {
    font-weight: 600; /* font-semibold */
    width: 6rem; /* w-24 */
}

.form-input {
    flex-grow: 1; /* flex-auto */
    border-radius: 9999px; /* rounded-full */
    background-color: #2e3a59; /* bg-gunMetal */
    border: none;
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem; /* gap-2 */
}

.dialog-cancel {
    border-color: #e74c3c; /* border-error */
    color: #e74c3c; /* text-error */
    background-color: transparent;
    border-radius: 9999px;
}

.dialog-cancel:hover {
    background-color: #e74c3c; /* hover:bg-error */
    color: white;
}

.dialog-create {
    border-radius: 9999px; /* rounded-full */
}

</style>
