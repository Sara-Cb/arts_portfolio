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

// Touch swipe
const touchStartX = ref(0);
const touchEndX = ref(0);
const imageWrap = ref(null);

function handleTouchStart(e) {
  touchStartX.value = e.touches[0].clientX;
}

function handleTouchMove(e) {
  touchEndX.value = e.touches[0].clientX;
}

function handleTouchEnd() {
  const diff = touchStartX.value - touchEndX.value;
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

  touchStartX.value = 0;
  touchEndX.value = 0;
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

// Auto-hide swipe hint dopo 2 secondi
let hintTimeout;
onMounted(() => {
  hintTimeout = setTimeout(() => {
    showSwipeHint.value = false;
  }, 2000);
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
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
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
        <p v-if="projectMaterials" class="info-materials">
          <strong>Materiali:</strong> {{ projectMaterials }}
        </p>
        <p v-if="projectDescription" class="info-description">
          {{ projectDescription }}
        </p>
      </div>
    </Transition>
  </div>
</template>
