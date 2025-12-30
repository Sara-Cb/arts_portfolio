<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";
import { useGalleryStore } from "@/stores/gallery";
import { useEnvironmentStore } from "@/stores/environment";

const gallery = useGalleryStore();
const env = useEnvironmentStore();

const isMobile = computed(() => env.width < 576);

// Computed properties for navigation state
const isFirstImage = computed(() => gallery.currentIndex === 0);
const isLastImage = computed(() => gallery.currentIndex === gallery.images.length - 1);

// Drag/Swipe support
const startX = ref(0);
const endX = ref(0);
const isDragging = ref(false);

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
  const threshold = 50;

  if (Math.abs(diff) > threshold) {
    if (diff > 0) gallery.next();
    else gallery.prev();
  }

  startX.value = 0;
  endX.value = 0;
}

// Keyboard navigation
function handleKeydown(e) {
  if (!gallery.isOpen) return;

  if (e.key === "Escape") gallery.closeGallery();
  else if (e.key === "ArrowLeft") gallery.prev();
  else if (e.key === "ArrowRight") gallery.next();
}

// Click navigation areas (left 25%, center 50%, right 25%)
function handleImageClick(e) {
  if (isMobile.value) return; // mobile usa solo frecce

  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;
  const zone = x / width;

  if (zone < 0.25) gallery.prev();
  else if (zone > 0.75) gallery.next();
  else gallery.closeGallery(); // center zone closes
}

// Auto-close on resize to mobile
watch(() => env.width, (newWidth, oldWidth) => {
  if (gallery.isOpen && oldWidth >= 576 && newWidth < 576) {
    gallery.closeGallery();
  }
});

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (gallery.isOpen) gallery.closeGallery(); // cleanup
});
</script>

<template>
  <Teleport to="body">
    <Transition name="gallery-fade">
      <div v-if="gallery.isOpen" class="fullscreen-gallery" role="dialog" aria-modal="true" aria-label="Full screen image gallery">
        <!-- Backdrop blur - cliccabile per chiudere -->
        <div class="gallery-backdrop" @click="gallery.closeGallery()" aria-hidden="true"></div>

        <!-- Main content -->
        <div class="gallery-content" role="document">
          <!-- Header bar -->
          <div class="gallery-header" role="toolbar" aria-label="Gallery controls">
            <!-- Info button (desktop only, left) -->
            <button
              v-if="!isMobile"
              class="gallery-info-btn"
              :class="{ active: gallery.showInfo }"
              @click="gallery.toggleInfo"
              type="button"
              :aria-label="gallery.showInfo ? 'Hide project information' : 'Show project information'"
              :aria-pressed="gallery.showInfo"
            >
              <font-awesome-icon icon="fa-solid fa-circle-info" aria-hidden="true" />
            </button>

            <!-- Title (centered) -->
            <h2 class="gallery-title" id="gallery-title">{{ gallery.projectTitle }}</h2>

            <!-- Close button (right) -->
            <button
              class="gallery-close"
              @click="gallery.closeGallery"
              type="button"
              aria-label="Close gallery (Escape key)"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <!-- Image container -->
          <div
            class="gallery-image-wrap"
            role="img"
            :aria-label="`${gallery.currentImage?.alt || gallery.projectTitle}, image ${gallery.currentIndex + 1} of ${gallery.images.length}`"
            @click="handleImageClick"
            @touchstart="handleStart"
            @touchmove="handleMove"
            @touchend="handleEnd"
            @mousedown="handleStart"
            @mousemove="handleMove"
            @mouseup="handleEnd"
            @mouseleave="handleEnd"
          >
            <img
              v-if="gallery.currentImage"
              v-image-loader
              :src="gallery.currentImage.url"
              :alt="gallery.currentImage.alt"
              class="gallery-image"
              aria-hidden="true"
            />
            <!-- Navigation arrows -->
            <button
              class="gallery-nav gallery-nav--prev"
              :class="{ 'gallery-nav--mobile': isMobile }"
              @click.stop="gallery.prev"
              type="button"
              :disabled="isFirstImage"
              :aria-label="`Previous image (currently ${gallery.currentIndex + 1} of ${gallery.images.length})${isFirstImage ? ' - at first image' : ''}`"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>

            <button
              class="gallery-nav gallery-nav--next"
              :class="{ 'gallery-nav--mobile': isMobile }"
              @click.stop="gallery.next"
              type="button"
              :disabled="isLastImage"
              :aria-label="`Next image (currently ${gallery.currentIndex + 1} of ${gallery.images.length})${isLastImage ? ' - at last image' : ''}`"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </div>

          <!-- Screen reader only status -->
          <div class="sr-only" aria-live="polite" aria-atomic="true">
            Image {{ gallery.currentIndex + 1 }} of {{ gallery.images.length }}{{ gallery.currentImage?.alt ? ': ' + gallery.currentImage.alt : '' }}
          </div>

          <!-- Dots indicator (bottom center) -->
          <div class="gallery-dots" role="tablist" aria-label="Image selection">
            <button
              v-for="(img, idx) in gallery.images"
              :key="idx"
              class="gallery-dot"
              :class="{ active: idx === gallery.currentIndex }"
              @click.stop="gallery.goToIndex(idx)"
              type="button"
              role="tab"
              :aria-selected="idx === gallery.currentIndex ? 'true' : 'false'"
              :aria-label="`Go to image ${idx + 1} of ${gallery.images.length}`"
              :aria-current="idx === gallery.currentIndex ? 'true' : undefined"
            ></button>
          </div>

          <!-- Info panel (bottom left, 20% height, desktop only) -->
          <Transition name="info-slide">
            <aside
              v-if="!isMobile && gallery.showInfo"
              class="gallery-info-panel"
              role="region"
              aria-label="Project information"
            >
              <p v-if="gallery.projectMaterials" class="info-materials">
                <strong>Materiali:</strong> {{ gallery.projectMaterials }}
              </p>
              <p v-if="gallery.projectDescription" class="info-description">
                {{ gallery.projectDescription }}
              </p>
            </aside>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
