<script setup>
import TitleHero from '@/components/home/TitleHero.vue';
import { useCategoriesStore } from '@/stores/categories';
import { storeToRefs } from 'pinia';

const store = useCategoriesStore();
const { categories } = storeToRefs(store);

</script>

<template>
    <div class="pageContainer">
        <TitleHero />
        <div class="categories">
            <RouterLink v-for="(cat) in categories" :to="'/projects/' + cat.type" class="category" :class="cat.type"
                :key="cat.type">
                <div class="img"><img :src="cat.img" alt="photo"></div>
                <h5 class="label">{{ cat.title }}</h5>
            </RouterLink>
        </div>
    </div>
</template>
