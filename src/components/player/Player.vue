<script setup>
import { computed, onMounted, watch, nextTick } from "vue";
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
  } else {
    // Desktop: toggle showPlayer on click/enter
    const wasOpen = showPlayer.value;
    showPlayer.value = !showPlayer.value;

    // If we just opened the player, focus the first track button
    if (!wasOpen && showPlayer.value) {
      // Wait for DOM update
      nextTick(() => {
        const firstTrack = document.querySelector('.trackList .track');
        if (firstTrack) {
          firstTrack.focus();
        }
      });
    }
  }
}


function onVideoLoaded() {
  player.setVideoLoaded(true);
}

function togglePlayback() {
  if (player.isPlaying) {
    player.setVolume(0);
  } else {
    player.setVolume(player.volume === 0 ? 0.4 : player.volume);
  }
}

function handleTrackListBlur(event) {
  // Close player when focus leaves the trackList entirely
  const relatedTarget = event.relatedTarget;
  const trackListElement = event.currentTarget;

  // Don't close if focus is moving to another element inside trackList
  if (relatedTarget && trackListElement.contains(relatedTarget)) {
    return;
  }

  // Close the player
  showPlayer.value = false;

  // If focus not going anywhere specific, send it to ScrollIndicator
  if (!relatedTarget) {
    const scrollIndicator = document.querySelector('.scrollbar .dot');
    if (scrollIndicator) {
      scrollIndicator.focus();
    }
  }
}

function handleLastLinkKeydown(event) {
  // Trap Tab key on last link to loop back to playerIcon
  if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault();
    const playerIcon = document.querySelector('.playerIcon');
    if (playerIcon) {
      playerIcon.focus();
    }
  }
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
  <button
    type="button"
    class="playerIcon"
    @mouseenter="!isMobile ? (showPlayer = true) : null"
    @click="togglePlayer"
    :aria-label="isMobile && showPlayer ? 'Close player' : 'Open player'"
    :aria-expanded="!isMobile ? showPlayer : undefined"
  >
    <FontAwesomeIcon
      :icon="
        isMobile && showPlayer ? ['fas', 'xmark'] : ['fas', 'compact-disc']
      "
      aria-hidden="true"
    />
  </button>

  <Teleport to="#app">
    <!-- Mobile view -->
    <div class="player" v-if="isMobile && showPlayer">
      <div class="video" :class="{ loaded: isVideoLoaded }" role="presentation">
        <video
          autoplay
          muted
          loop
          playsinline
          preload="auto"
          class="video-bg"
          @loadeddata="onVideoLoaded"
          aria-hidden="true"
        >
          <source src="@/assets/media/video/player.mp4" type="video/mp4" />
        </video>
      </div>
      <div class="content">
        <div class="current">
          <div
            class="waves"
            @click="togglePlayback"
            :class="{ paused: player.isPlaying === false }"
            role="button"
            tabindex="0"
            :aria-label="player.isPlaying ? 'Pause' : 'Play'"
            @keydown.enter="togglePlayback"
            @keydown.space.prevent="togglePlayback"
          >
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
        <div class="socials">
          <a
            class="spotify"
            href="https://open.spotify.com/artist/6Tqf2cvcNjPdTVjuxynWEB?si=6Ig-mVObTReE7qo_8nB8_w"
            target="_blank"
            >Spotify</a
          >
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
      @focusout="handleTrackListBlur"
    >
      <ul class="list">
        <li v-for="(data, key) in player.audioMap" :key="key">
          <button
            type="button"
            class="track"
            :class="{ active: player.currentTrack === key }"
            @click="player.selectTrack(key)"
            :aria-label="`Play ${data.title}`"
          >
            <FontAwesomeIcon
              :icon="
                player.currentTrack === key
                  ? ['fas', 'chart-simple']
                  : ['fas', 'play']
              "
              class="playIcon"
              aria-hidden="true"
            />
            <span>{{ data.title }}</span>
          </button>
        </li>
        <li class="social-links">
          <span class="label">→ see more on:</span>
          <a
            class="spotify"
            href="https://open.spotify.com/artist/6Tqf2cvcNjPdTVjuxynWEB?si=6Ig-mVObTReE7qo_8nB8_w"
            target="_blank"
            >Spotify</a
          >
          <span class="separator">|</span>
          <a
            class="youtube"
            href="https://youtube.com/@ex.raehmm?si=51oFIqEIh9faCtA0"
            target="_blank"
            @keydown="handleLastLinkKeydown"
            >YouTube</a
          >
        </li>
      </ul>
    </div>
  </Teleport>
</template>
