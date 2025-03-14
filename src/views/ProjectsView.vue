<script setup>
import ProjectCard from '@/components/projects/ProjectCard.vue';
import { useCategoriesStore } from '@/stores/categories';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

const store = useCategoriesStore();
const { categories } = storeToRefs(store);

</script>

<template>
    <div class="pageContainer">
        <div class="projectsMenu">
            <h1 class="title">Projects</h1>
            <div class="categories">
                <RouterLink v-for="cat in categories" :to="'/projects/' + cat.type" :class="'category' + cat.type"
                    :key="cat.type">
                    <p>{{ cat.title }}</p>
                </RouterLink>
            </div>
        </div>
        <div class="projects">
            <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
        </div>
    </div>
</template>
