<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { usePlayerStore } from "@/stores/player";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useEnvironmentStore } from "@/stores/environment";

const player = usePlayerStore();

const showVolume = ref(false);
const sliderValue = ref(player.volume * 100);
const { isMobile } = storeToRefs(useEnvironmentStore());
let dragging = false;

// Computed value for ARIA
const volumePercent = computed(() => Math.round(sliderValue.value));

function toggleMute() {
  if (player.volume > 0) {
    player.setVolume(0);
    sliderValue.value = 0;
  } else {
    player.setVolume(0.4);
    sliderValue.value = 40;
  }
}

function startDrag(e) {
  dragging = true;
  updateVolume(e);
  window.addEventListener("mousemove", updateVolume);
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("touchmove", updateVolume);
  window.addEventListener("touchend", stopDrag);
}

function stopDrag() {
  dragging = false;
  window.removeEventListener("mousemove", updateVolume);
  window.removeEventListener("mouseup", stopDrag);
  window.removeEventListener("touchmove", updateVolume);
  window.removeEventListener("touchend", stopDrag);
}

function updateVolume(e) {
  const bar = document.querySelector(".volumeBar .bar");
  if (!bar) return;

  const rect = bar.getBoundingClientRect();

  let clientX = e.clientX;
  let clientY = e.clientY;

  if (e.touches && e.touches.length) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }

  let percent;

  if (isMobile.value) {
    const offsetX = clientX - rect.left;
    percent = Math.round((offsetX / rect.width) * 100);
  } else {
    const offsetY = clientY - rect.top;
    percent = 100 - Math.round((offsetY / rect.height) * 100);
  }

  percent = Math.min(100, Math.max(0, percent));
  sliderValue.value = percent;
  player.setVolume(percent / 100);
}

// Keyboard navigation for volume slider
function handleSliderKeydown(e) {
  const step = 5; // 5% increments
  const largeStep = 10; // 10% increments for Page Up/Down

  let newValue = sliderValue.value;

  switch(e.key) {
    case 'ArrowUp':
    case 'ArrowRight':
      e.preventDefault();
      newValue = Math.min(100, sliderValue.value + step);
      break;
    case 'ArrowDown':
    case 'ArrowLeft':
      e.preventDefault();
      newValue = Math.max(0, sliderValue.value - step);
      break;
    case 'PageUp':
      e.preventDefault();
      newValue = Math.min(100, sliderValue.value + largeStep);
      break;
    case 'PageDown':
      e.preventDefault();
      newValue = Math.max(0, sliderValue.value - largeStep);
      break;
    case 'Home':
      e.preventDefault();
      newValue = 0;
      break;
    case 'End':
      e.preventDefault();
      newValue = 100;
      break;
    default:
      return;
  }

  sliderValue.value = newValue;
  player.setVolume(newValue / 100);
}

watch(
  () => player.volume,
  (newVolume) => {
    sliderValue.value = newVolume * 100;
  }
);

onMounted(() => {
  sliderValue.value = player.volume * 100;
});

onBeforeUnmount(() => {
  stopDrag();
});
</script>

<template>
  <!-- DESKTOP -->
  <div
    class="volumeController desktop"
    @mouseenter="showVolume = true"
    @mouseleave="showVolume = false"
    v-if="!isMobile"
    role="group"
    aria-label="Volume controls"
  >
    <div class="volumeBar" v-if="showVolume" role="presentation">
      <div
        class="bar"
        role="slider"
        tabindex="0"
        :aria-label="`Volume: ${volumePercent}%`"
        :aria-valuenow="volumePercent"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-orientation="vertical"
        @click="updateVolume"
        @mousedown.prevent="startDrag"
        @touchstart.prevent="startDrag"
        @keydown="handleSliderKeydown"
      >
        <div class="progress" :style="{ height: `${sliderValue}%` }"></div>
        <div class="handle" :style="{ bottom: `${sliderValue}%` }"></div>
      </div>
    </div>
    <button
      type="button"
      class="volume-icon-btn"
      @click="toggleMute"
      :aria-label="player.volume === 0 ? 'Unmute' : 'Mute'"
    >
      <FontAwesomeIcon
        :icon="
          player.volume === 0
            ? ['fas', 'volume-xmark']
            : player.volume < 0.5
            ? ['fas', 'volume-low']
            : ['fas', 'volume-high']
        "
        aria-hidden="true"
      />
    </button>
  </div>

  <!-- MOBILE -->
  <div class="volumeController mobile" v-else role="group" aria-label="Volume controls">
    <button
      type="button"
      class="volume-icon-btn"
      @click="toggleMute"
      :aria-label="player.volume === 0 ? 'Unmute' : 'Mute'"
    >
      <FontAwesomeIcon
        :icon="
          player.volume === 0
            ? ['fas', 'volume-xmark']
            : player.volume < 0.5
            ? ['fas', 'volume-low']
            : ['fas', 'volume-high']
        "
        aria-hidden="true"
      />
    </button>
    <div class="volumeBar" role="presentation">
      <div
        class="bar"
        role="slider"
        tabindex="0"
        :aria-label="`Volume: ${volumePercent}%`"
        :aria-valuenow="volumePercent"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-orientation="horizontal"
        @click="updateVolume"
        @mousedown.prevent="startDrag"
        @touchstart.prevent="startDrag"
        @keydown="handleSliderKeydown"
      >
        <div class="progress" :style="{ width: `${sliderValue}%` }"></div>
        <div class="handle" :style="{ left: `${sliderValue}%` }"></div>
      </div>
    </div>
  </div>
</template>
