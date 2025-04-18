<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { usePlayerStore } from "@/stores/player";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import VolumeController from "./VolumeController.vue";

const player = usePlayerStore();

const showPlayer = ref(false);
const isMobile = ref(window.innerWidth <= 576);

const nextTracks = computed(() => {
  const trackEntries = Object.entries(player.audioMap);
  const currentIndex = trackEntries.findIndex(
    ([key]) => key === player.currentTrack
  );

  const result = [];
  for (let i = 1; i < trackEntries.length; i++) {
    const nextIndex = (currentIndex + i) % trackEntries.length;
    result.push(trackEntries[nextIndex]);
  }

  return result;
});

function togglePlayer() {
  if (isMobile.value) {
    showPlayer.value = !showPlayer.value;
  }
}

onMounted(() => {
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 576;
  });
  player.initListeners();
});
</script>

<template>
  <!-- Player component for desktop and mobile views -->

  <!-- Desktop view -->
  <VolumeController v-if="!isMobile" />

  <!-- Desktop and Mobile view -->
  <div
    class="playerIcon"
    @mouseenter="!isMobile ? (showPlayer = true) : null"
    @click="togglePlayer"
  >
    <FontAwesomeIcon :icon="['fas', 'compact-disc']" />
  </div>

  <Teleport to="#app">
    <!-- Mobile view -->
    <div class="player" v-if="isMobile && showPlayer">
      <div class="current">
        <div class="waves" :class="{ paused: player.isPlaying === false }">
          <div class="wave" v-for="i in 5" :key="i"></div>
        </div>
        <h3 class="title">
          {{ player.audioMap[player.currentTrack].title }}
        </h3>
      </div>
      <VolumeController />
      <div>
        <div class="trackList">
          <ul class="list">
            <li
              class="track"
              v-for="([key, data], i) in nextTracks"
              :key="key"
              :class="{ active: player.currentTrack === key }"
              @click="player.selectTrack(key)"
            >
              <span>{{ data.title }}</span>
            </li>
          </ul>
        </div>
        <div class="spotify">
          <a
            href="https://open.spotify.com/intl-it/artist/6ivgRDsZOfEQ8z287GAsF1?si=3GK1cbiySaKik1wrHQSndw"
            target="_blank"
            >→ see more on Spotify</a
          >
        </div>
      </div>
    </div>

    <!-- Desktop view -->
    <div
      class="trackList"
      v-if="!isMobile && showPlayer"
      @mouseleave="showPlayer = false"
    >
      <ul class="list">
        <li
          class="track"
          v-for="(data, key) in player.audioMap"
          :key="key"
          :class="{ active: player.currentTrack === key }"
          @click="player.selectTrack(key)"
        >
          <FontAwesomeIcon
            :icon="
              player.currentTrack === key
                ? ['fas', 'chart-simple']
                : ['fas', 'play']
            "
            class="playIcon"
          />
          <span>{{ data.title }}</span>
        </li>
        <li class="spotify">
          <a
            href="https://open.spotify.com/intl-it/artist/6ivgRDsZOfEQ8z287GAsF1?si=3GK1cbiySaKik1wrHQSndw"
            target="_blank"
            >→ see more on Spotify</a
          >
        </li>
      </ul>
    </div>
  </Teleport>
</template>
