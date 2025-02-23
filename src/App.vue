<script setup>
import { RouterView, useRoute } from 'vue-router'
import HeaderComp from './components/HeaderComponent.vue'
import FooterComp from './components/FooterComponent.vue'
import { computed, onMounted } from 'vue'

const route = useRoute()

const mainClass = computed(() => {
  if (route.name === 'home') return 'homePage'
  if (route.name === 'about') return 'aboutPage'
  if (route.name === 'projects') return 'projectsPage'
  if (route.name === 'not-found') return 'notFoundPage'
  // ...
  return ''
})

onMounted(() => {
  console.log(`Hello curious friend! \nI am Sara.cb and I wrote this code, if you like this portfolio, check out my github profile! \n https://github.com/Sara-Cb`)
}
)
</script>

<template>
  <HeaderComp />
  <main :class="mainClass">
    <RouterView />
  </main>
</template>
