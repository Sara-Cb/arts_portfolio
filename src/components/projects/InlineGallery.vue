<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  images: { type: Array, required: true },
  projectTitle: { type: String, default: "" },
  projectMaterials: { type: String, default: "" },
  projectDescription: { type: String, default: "" },
});

const currentIndex = ref(0);
const showInfo = ref(false);
const showSwipeHint = ref(true);

const currentImage = computed(() => {
  if (props.images.length === 0) return null;
  return props.images[currentIndex.value];
});

// Touch/Mouse swipe
const startX = ref(0);
const endX = ref(0);
const isDragging = ref(false);
const imageWrap = ref(null);

function handleStart(e) {
  isDragging.value = true;
  startX.value = e.touches ? e.touches[0].clientX : e.clientX;
}

function handleMove(e) {
  if (!isDragging.value) return;
  endX.value = e.touches ? e.touches[0].clientX : e.clientX;
}

function handleEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;

  const diff = startX.value - endX.value;
  const threshold = 50; // minimo swipe di 50px

  if (Math.abs(diff) > threshold) {
    // Nascondi hint al primo swipe
    if (showSwipeHint.value) {
      showSwipeHint.value = false;
    }

    if (diff > 0) {
      // Swipe left -> next
      next();
    } else {
      // Swipe right -> prev
      prev();
    }
  }

  startX.value = 0;
  endX.value = 0;
}

function next() {
  if (currentIndex.value >= props.images.length - 1) {
    currentIndex.value = 0; // loop
  } else {
    currentIndex.value++;
  }
}

function prev() {
  if (currentIndex.value <= 0) {
    currentIndex.value = props.images.length - 1; // loop
  } else {
    currentIndex.value--;
  }
}

function goToIndex(idx) {
  currentIndex.value = idx;
  // Nascondi hint quando si usano i dots
  if (showSwipeHint.value) {
    showSwipeHint.value = false;
  }
}

function toggleInfo() {
  showInfo.value = !showInfo.value;
}

// Auto-hide swipe hint dopo 3 secondi, mostra solo la prima volta
let hintTimeout;
onMounted(() => {
  // Controlla se l'hint è già stato mostrato in questa sessione
  const hintShown = sessionStorage.getItem('swipe-hint-shown');

  if (hintShown) {
    showSwipeHint.value = false;
  } else {
    sessionStorage.setItem('swipe-hint-shown', 'true');
    hintTimeout = setTimeout(() => {
      showSwipeHint.value = false;
    }, 3000);
  }
});

onBeforeUnmount(() => {
  if (hintTimeout) clearTimeout(hintTimeout);
});
</script>

<template>
  <div class="inline-gallery">
    <!-- Image container con swipe -->
    <div
      ref="imageWrap"
      class="ig-image-wrap"
      @touchstart="handleStart"
      @touchmove="handleMove"
      @touchend="handleEnd"
      @mousedown="handleStart"
      @mousemove="handleMove"
      @mouseup="handleEnd"
      @mouseleave="handleEnd"
    >
      <img
        v-if="currentImage"
        v-image-loader
        :src="currentImage.url"
        :alt="currentImage.alt"
        class="ig-image"
      />

      <!-- Swipe hint -->
      <Transition name="hint-fade">
        <div v-if="showSwipeHint" class="swipe-hint">
          <font-awesome-icon icon="fa-solid fa-chevron-left" class="hint-arrow hint-arrow--left" />
          <span class="hint-text">swipe</span>
          <font-awesome-icon icon="fa-solid fa-chevron-right" class="hint-arrow hint-arrow--right" />
        </div>
      </Transition>

      <!-- Bottom controls bar -->
      <div class="ig-controls">
        <!-- Info button (bottom left) -->
        <button
          class="ig-info-btn"
          :class="{ active: showInfo }"
          @click="toggleInfo"
          aria-label="Informazioni opera"
        >
          <font-awesome-icon icon="fa-solid fa-circle-info" />
        </button>

        <!-- Dots indicator (bottom center) -->
        <div class="ig-dots">
          <button
            v-for="(img, idx) in images"
            :key="idx"
            class="ig-dot"
            :class="{ active: idx === currentIndex }"
            @click="goToIndex(idx)"
            :aria-label="`Vai all'immagine ${idx + 1}`"
          ></button>
        </div>

        <!-- Navigation arrows (bottom right) -->
        <div class="ig-arrows">
          <button
            class="ig-arrow ig-arrow--prev"
            @click="prev"
            aria-label="Immagine precedente"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" />
          </button>
          <button
            class="ig-arrow ig-arrow--next"
            @click="next"
            aria-label="Immagine successiva"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>

    <!-- Info panel (collapsible, sotto immagine) -->
    <Transition name="info-slide">
      <div v-if="showInfo" class="ig-info-panel" @click="toggleInfo">
        <p v-if="projectDescription" class="info-description">
          {{ projectDescription }}
        </p>
        <p v-if="projectMaterials" class="info-materials">
          {{ projectMaterials }}
        </p>
      </div>
    </Transition>
  </div>
</template>
