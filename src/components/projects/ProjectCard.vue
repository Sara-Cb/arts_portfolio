<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

</script>
<template>
    <div class="projectPreview">
        <div class="img">
            <img :src="project.img" alt="project">
        </div>
        <div class="info">
            <h3 class="title">{{ project.title }}</h3>
            <p class="description">{{ project.description }}</p>
            <div class="tags">
                <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
            </div>
        </div>
    </div>
</template>