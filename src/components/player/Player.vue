<script setup>
import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePlayerStore } from "@/stores/player";
import { useUiStore } from "@/stores/ui";
import { useEnvironmentStore } from "@/stores/environment";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import VolumeController from "./VolumeController.vue";

const player = usePlayerStore();
const ui = useUiStore();

const { isMobile } = storeToRefs(useEnvironmentStore());
const { showPlayer, isVideoLoaded } = storeToRefs(player);

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
    player.togglePlayer();
  }
}

function onVideoLoaded() {
  player.setVideoLoaded(true);
}

onMounted(() => {
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 576;
  });
  player.initListeners();
});

watch(showPlayer, (open) => {
  if (!isMobile.value) return;
  open ? ui.openPlayer() : ui.closePlayer();
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
    <FontAwesomeIcon
      :icon="isMobile && showPlayer ? ['fas', 'xmark'] : ['fas', 'compact-disc']"
    />
  </div>

  <Teleport to="#app">
    <!-- Mobile view -->
    <div class="player" v-if="isMobile && showPlayer">
      <div class="video" :class="{ loaded: isVideoLoaded }">
        <video
          autoplay
          muted
          loop
          playsinline
          preload="auto"
          class="video-bg"
          @loadeddata="onVideoLoaded"
        >
          <source src="@/assets/media/video/player.mp4" type="video/mp4" />
        </video>
      </div>
      <div class="content">
        <div class="current">
          <div class="waves" :class="{ paused: player.isPlaying === false }">
            <div class="wave" v-for="i in 5" :key="i"></div>
          </div>
          <h3 class="title">
            {{ player.audioMap[player.currentTrack].title }}
          </h3>
          <VolumeController />
        </div>
        <div class="trackList">
          <p class="next">next up:</p>
          <ul class="list">
            <li
              class="track"
              v-for="[key, data] in nextTracks"
              :key="key"
              :class="{ active: player.currentTrack === key }"
              @click="player.selectTrack(key)"
            >
              <span>{{ data.title }}</span>
            </li>
          </ul>
        </div>
        <!-- Spotify links temporarily hidden - will be re-enabled later -->
        <!-- <div class="socials">
          <a
            class="spotify"
            href="https://open.spotify.com/intl-it/artist/6ivgRDsZOfEQ8z287GAsF1?si=3GK1cbiySaKik1wrHQSndw"
            target="_blank"
            >Spotify</a
          >
        </div> -->
        <div class="socials">
          <a
            class="youtube"
            href="https://youtube.com/@ex.raehmm?si=51oFIqEIh9faCtA0"
            target="_blank"
            >YouTube</a
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
        <!-- <li class="spotify">
          <a
            href="https://open.spotify.com/intl-it/artist/6ivgRDsZOfEQ8z287GAsF1?si=3GK1cbiySaKik1wrHQSndw"
            target="_blank"
            >→ see more on Spotify</a
          >
        </li> -->
        <li class="youtube">
          <a
            href="https://youtube.com/@ex.raehmm?si=51oFIqEIh9faCtA0"
            target="_blank"
            >→ see more on YouTube</a
          >
        </li>
      </ul>
    </div>
  </Teleport>
</template>
