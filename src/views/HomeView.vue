<script setup>
import Category from '@/components/home/Category.vue';
import TitleHero from '@/components/home/TitleHero.vue';
import { ref } from 'vue';

const categories = ref([
    { name: 'Sculpture', img: 'https://via.assets.so/game.png?id=1&q=95&w=360&h=360&fit=fill' },
    { name: 'Photography', img: 'https://via.assets.so/game.png?id=2&q=95&w=360&h=360&fit=fill' },
    { name: 'Performance', img: 'https://via.assets.so/game.png?id=3&q=95&w=360&h=360&fit=fill' },
])

</script>

<template>
    <div class="pageContainer">
        <TitleHero />
        <div class="categories">
            <Category v-for="(cat) in categories" :name='cat.name' :key="cat.name" :img="cat.img" />
        </div>
    </div>
</template>
