<script setup>
import { ref, onMounted } from "vue";
import { usePlayerStore } from "@/stores/player";
import Logo from "@/assets/logo/Logo.vue";
import { RouterLink } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

function toggleLabel(target) {
  if (isMobile.value) {
    return;
  }
  const label = document.querySelector(`.${target} .label`);
  if (label) {
    label.classList.toggle("openLabel");
  }
}

const player = usePlayerStore();
onMounted(() => {
  player.initListeners();
});

const showVolume = ref(false);
const showTracks = ref(false);
const isMobile = ref(window.innerWidth <= 768);

window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth <= 768;
});

function toggleMute() {
  if (player.volume > 0) {
    player.setVolume(0);
  } else {
    player.setVolume(1);
  }
}
</script>

<template>
  <header :class="{ mobile: isMobile }">
    <div class="logo">
      <RouterLink to="/">
        <Logo color="ghost" background="transparent" />
      </RouterLink>
    </div>

    <nav class="navMenu">
      <ul>
        <li>
          <RouterLink to="/raehm" class="navLink">
            <FontAwesomeIcon :icon="['fas', 'home']" />
            <span v-if="!isMobile" class="label">Home</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/projects" class="navLink">
            <FontAwesomeIcon :icon="['fas', 'folder']" />
            <span v-if="!isMobile" class="label">Projects</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/visit-card" class="navLink">
            <FontAwesomeIcon :icon="['fas', 'address-card']" />
            <span v-if="!isMobile" class="label">Contact</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="playerMenu">
      <div
        class="volume"
        @mouseenter="showVolume = true"
        @mouseleave="showVolume = false"
      >
        <FontAwesomeIcon
          :icon="
            player.volume === 0
              ? ['fas', 'volume-xmark']
              : ['fas', 'volume-high']
          "
          @click="toggleMute"
        />
        <div class="volumeBar" v-if="showVolume">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="player.volume"
            @input="player.setVolume(player.volume)"
          />
        </div>
      </div>

      <div
        class="trackList"
        @mouseenter="showTracks = true"
        @mouseleave="showTracks = false"
      >
        <FontAwesomeIcon :icon="['fas', 'compact-disc']" />
        <div class="tracks" v-if="showTracks">
          <ul>
            <li
              v-for="(data, key) in player.audioMap"
              :key="key"
              :class="{ active: player.currentTrack === key }"
              @click="player.selectTrack(key)"
            >
              {{ data.title }}
            </li>
            <li>
              <a
                href="https://open.spotify.com/intl-it/artist/6ivgRDsZOfEQ8z287GAsF1?si=3GK1cbiySaKik1wrHQSndw"
                target="_blank"
                >→ see more on Spotify</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>
