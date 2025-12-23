import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGalleryStore = defineStore('gallery', () => {
  const isOpen = ref(false)
  const currentIndex = ref(0)
  const images = ref([])
  const showInfo = ref(false)

  // Project metadata
  const projectTitle = ref('')
  const projectMaterials = ref('')
  const projectDescription = ref('')

  const currentImage = computed(() => {
    if (images.value.length === 0 || currentIndex.value < 0) {
      return null
    }
    return images.value[currentIndex.value]
  })

  const hasNext = computed(() => {
    return currentIndex.value < images.value.length - 1
  })

  const hasPrev = computed(() => {
    return currentIndex.value > 0
  })

  function openGallery(imageArray, startIndex = 0, metadata = {}) {
    images.value = imageArray
    currentIndex.value = startIndex
    projectTitle.value = metadata.title || ''
    projectMaterials.value = metadata.materials || ''
    projectDescription.value = metadata.description || ''
    showInfo.value = false
    isOpen.value = true
  }

  function closeGallery() {
    isOpen.value = false
    showInfo.value = false
    setTimeout(() => {
      images.value = []
      currentIndex.value = 0
      projectTitle.value = ''
      projectMaterials.value = ''
      projectDescription.value = ''
    }, 300)
  }

  function toggleInfo() {
    showInfo.value = !showInfo.value
  }

  function next() {
    if (currentIndex.value >= images.value.length - 1) {
      // Loop: dall'ultima torna alla prima
      currentIndex.value = 0
    } else {
      currentIndex.value++
    }
  }

  function prev() {
    if (currentIndex.value <= 0) {
      // Loop: dalla prima va all'ultima
      currentIndex.value = images.value.length - 1
    } else {
      currentIndex.value--
    }
  }

  function goToIndex(index) {
    if (index >= 0 && index < images.value.length) {
      currentIndex.value = index
    }
  }

  return {
    isOpen,
    currentIndex,
    images,
    showInfo,
    projectTitle,
    projectMaterials,
    projectDescription,
    currentImage,
    hasNext,
    hasPrev,
    openGallery,
    closeGallery,
    toggleInfo,
    next,
    prev,
    goToIndex
  }
})