import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


export const useCategoriesStore = defineStore('categories', () => {

  const sculpture = {
    type: 'sculpture',
    title: 'Sculpture',
    img: 'https://via.assets.so/game.png?id=1&q=95&w=360&h=360&fit=fill',
  }
  const photography = {
    type: 'photography',
    title: 'Photography',
    img: 'https://via.assets.so/game.png?id=2&q=95&w=360&h=360&fit=fill',
  }
  const performance = {
    type: 'performance',
    title: 'Performance',
    img: 'https://via.assets.so/game.png?id=3&q=95&w=360&h=360&fit=fill',
  }

  const categories = ref([sculpture, photography, performance])

  return { categories }
})
