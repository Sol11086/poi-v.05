<script setup>
import { ref } from 'vue'


</script>

<template>
 <Card class="custom-card">
    <template #content>
        <div class="custom-content">
            <div class="custom-avatar">
                <Avatar
                    image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                    shape="circle"
                />
            </div>
            <div class="content-text">
                <p class="user-name"> Usuario 1 </p>
                <p class="task-description"> A subido una tarea a este grupo </p>
            </div>
        </div>
    </template>
    <template #footer>
        <div class="custom-footer">
            <small> martes 15:32 </small>
        </div>
    </template>
</Card>

<Card class="custom-card">
    <template #content>
        <div class="custom-content">
            <div class="custom-avatar">
                <Avatar
                    image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                    shape="circle"
                />
            </div>
            <div class="content-text">
                <p class="user-name"> Usuario 1 </p>
                <p class="task-description"> A subido una tarea a este grupo </p>
            </div>
        </div>
    </template>
    <template #footer>
        <div class="custom-footer">
            <small> martes 15:32 </small>
        </div>
    </template>
</Card>

<Card class="custom-card">
    <template #content>
        <div class="custom-content">
            <div class="custom-avatar">
                <Avatar
                    image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                    shape="circle"
                />
            </div>
            <div class="content-text">
                <p class="user-name"> Usuario 1 </p>
                <p class="task-description"> A subido una tarea a este grupo </p>
            </div>
        </div>
    </template>
    <template #footer>
        <div class="custom-footer">
            <small> martes 15:32 </small>
        </div>
    </template>
</Card>

<Card class="custom-card">
    <template #content>
        <div class="custom-content">
            <div class="custom-avatar">
                <Avatar
                    image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                    shape="circle"
                />
            </div>
            <div class="content-text">
                <p class="user-name"> Usuario 1 </p>
                <p class="task-description"> A subido una tarea a este grupo </p>
            </div>
        </div>
    </template>
    <template #footer>
        <div class="custom-footer">
            <small> martes 15:32 </small>
        </div>
    </template>
</Card>
</template>

<style scoped>

.custom-card {
    background-color: #1a1d22; /* rich black */
    padding: 0;
    margin-bottom: 1rem;
    height: 10rem;
}

.custom-content {
    display: flex;
    gap: 1rem;
}

.custom-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
}

.content-text {
    grid-column: span 2;
}

.user-name {
    font-size: 1.25rem;
    font-weight: bold;
    color: #d1d5db; /* Surface color */
}

.task-description {
    color: #d1d5db; /* Surface color */
}

.custom-footer {
    display: flex;
    justify-content: flex-end;
}

.custom-footer small {
    font-size: 0.875rem;
}

.search-input {
  width: 25rem;
  border-radius: 9999px;
  background-color: #21333D; /* Gunmetal color */
  border: none;
}
</style>
