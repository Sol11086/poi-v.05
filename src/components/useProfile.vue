<script setup>
import { ref } from 'vue'

defineProps({
    user: Object
})

</script>

<template>
    <div class="gap-4 pl-14 pr-14 p-4 h-full">
        <div class="bg-[#121C22] h-1/5 rounded-3xl mb-4 p-5 flex justify-between">
            <div class="flex items-center justify-center">
                <img :src="user.avatar" class="w-20 h-20 rounded-full" />
                <h2 class="text-xl font-bold text-white">{{ user.name }}</h2>
            </div>
            <div class="flex gap-10 justify-center items-center">
                <Button icon="pi pi-phone" variant="text" size="large" @click="visibleNotis = true" rounded
                    class="text-[#9F86F9] hover:text-[#121C22] hover:bg-[#9F86F9]" />
                <Button icon="pi pi-inbox" variant="text" @click="setActiveComponent('teams')" size="large" rounded
                    class="text-[#9F86F9] hover:text-[#121C22] hover:bg-[#9F86F9]" />
                <Button icon="pi pi-comments" variant="text" size="large" @click="visibleChat = true" rounded
                    class="text-[#9F86F9] hover:text-[#121C22] hover:bg-[#9F86F9]" />
            </div>
        </div>
        <div class="bg-[#121C22] h-full rounded-3xl">
        </div>
        <div class="top-72 left-32">

            <!-- más info aquí -->
        </div>
    </div>

</template>

<style scoped>
.scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

:deep(.scrollbar-hide::-webkit-scrollbar) {
    width: 0px;
    height: 0px;
    background: transparent;
}
</style>