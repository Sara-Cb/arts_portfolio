<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { usePlayerStore } from "@/stores/player";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const player = usePlayerStore();

const showVolume = ref(false);
const sliderValue = ref(player.volume * 100);
const isMobile = ref(window.innerWidth <= 576);
let dragging = false;

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

  // Supporto per touch
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

onMounted(() => {
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 576;
  });
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
  >
    <div class="volumeBar" v-if="showVolume">
      <div
        class="bar"
        @click="updateVolume"
        @mousedown.prevent="startDrag"
        @touchstart.prevent="startDrag"
      >
        <div class="progress" :style="{ height: `${sliderValue}%` }"></div>
        <div class="handle" :style="{ bottom: `${sliderValue}%` }"></div>
      </div>
    </div>
    <FontAwesomeIcon
      :icon="
        player.volume === 0
          ? ['fas', 'volume-xmark']
          : player.volume < 0.5
          ? ['fas', 'volume-low']
          : ['fas', 'volume-high']
      "
      @click="toggleMute"
    />
  </div>

  <!-- MOBILE -->
  <div class="volumeController mobile" v-else>
    <FontAwesomeIcon
      :icon="
        player.volume === 0
          ? ['fas', 'volume-xmark']
          : player.volume < 0.5
          ? ['fas', 'volume-low']
          : ['fas', 'volume-high']
      "
      @click="toggleMute"
    />
    <div class="volumeBar">
      <div
        class="bar"
        @click="updateVolume"
        @mousedown.prevent="startDrag"
        @touchstart.prevent="startDrag"
      >
        <div class="progress" :style="{ width: `${sliderValue}%` }"></div>
        <div class="handle" :style="{ left: `${sliderValue}%` }"></div>
      </div>
    </div>
  </div>
</template>
