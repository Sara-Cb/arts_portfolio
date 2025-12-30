<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useEnvironmentStore } from "@/stores/environment";
import { usePlayerStore } from "@/stores/player";
import { useRoute } from "vue-router";

const props = defineProps({ project: { type: Object, required: true } });
const env = useEnvironmentStore();
const playerStore = usePlayerStore();
const route = useRoute();

const isMobile = computed(() => env.width < 576);
const showLyrics = ref(false);
const youtubePlayer = ref(null);
const iframeId = ref(
  `youtube-player-${Math.random().toString(36).substring(2, 11)}`
);
const isPlaying = ref(false); // Video playing state (full play vs preview loop)
const currentTime = ref(0);
const duration = ref(0);
const isDragging = ref(false);
let apiCheckInterval = null;

const hasLyrics = computed(() => {
  return props.project?.lyrics && props.project.lyrics.trim().length > 0;
});

// Determine platform for "Listen on" button
const listenPlatform = computed(() => {
  if (props.project?.links?.spotify)
    return { name: "Spotify", url: props.project.links.spotify };
  if (props.project?.links?.youtube)
    return { name: "YouTube", url: props.project.links.youtube };
  return null;
});

// Format time as MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const currentTimeFormatted = computed(() => formatTime(currentTime.value));
const durationFormatted = computed(() => formatTime(duration.value));
const progressPercent = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

function toggleLyrics() {
  showLyrics.value = !showLyrics.value;
}

function openListenLink() {
  if (listenPlatform.value?.url) {
    window.open(listenPlatform.value.url, "_blank");
  }
}

// Initialize YouTube IFrame API
function initYouTubeAPI() {
  // Load YouTube IFrame API if not already loaded
  if (!window.YT) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Set up callback for when API loads
    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (originalCallback) originalCallback();
      createPlayer();
    };
  } else if (window.YT && window.YT.Player) {
    // API already loaded, create player immediately
    createPlayer();
  } else {
    // API is loading, wait for it
    if (apiCheckInterval) clearInterval(apiCheckInterval);
    apiCheckInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(apiCheckInterval);
        apiCheckInterval = null;
        createPlayer();
      }
    }, 100);
  }
}

function createPlayer() {
  if (!props.project?.videoId) return;

  // Ensure div exists before creating player
  const playerDiv = document.getElementById(iframeId.value);
  if (!playerDiv) {
    console.warn(`[MusicDetail] Player div not found: ${iframeId.value}`);
    return;
  }

  try {
    youtubePlayer.value = new window.YT.Player(iframeId.value, {
      videoId: props.project.videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        loop: 1,
        playlist: props.project.videoId, // Required for loop
        controls: 0,
        modestbranding: 1,
        rel: 0,
        enablejsapi: 1,
      },
      events: {
        onStateChange: onPlayerStateChange,
        onReady: onPlayerReady,
        onError: (event) => {
          console.error('[MusicDetail] YouTube player error:', event.data);
        },
      },
    });
  } catch (error) {
    console.error('[MusicDetail] Error creating YouTube player:', error);
  }
}

function onPlayerReady(event) {
  // Video is ready, start preview loop (muted)
  event.target.mute();
  event.target.playVideo();
  duration.value = event.target.getDuration();
  startProgressTracking();
}

function onPlayerStateChange(event) {
  // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
  const state = event.data;

  if (state === 1) {
    // Playing
    if (!isPlaying.value) {
      // In preview loop mode, pause audio player
      if (playerStore.isPlaying) {
        playerStore.pause();
      }
    }
  }
}

// Progress tracking interval
let progressInterval = null;

function startProgressTracking() {
  if (progressInterval) clearInterval(progressInterval);

  progressInterval = setInterval(() => {
    if (youtubePlayer.value && youtubePlayer.value.getCurrentTime) {
      currentTime.value = youtubePlayer.value.getCurrentTime();
    }
  }, 100);
}

function stopProgressTracking() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// Toggle play/pause on video tap
function toggleVideoPlay() {
  if (!youtubePlayer.value) return;

  if (isPlaying.value) {
    // Pause video at current position (don't reset)
    youtubePlayer.value.pauseVideo();
    isPlaying.value = false;
  } else {
    // Start full playback from beginning with sound
    youtubePlayer.value.seekTo(0, true);
    youtubePlayer.value.unMute();
    youtubePlayer.value.playVideo();
    isPlaying.value = true;

    // Pause audio player
    if (playerStore.isPlaying) {
      playerStore.pause();
    }
  }
}

// Progress bar dragging
function onProgressMouseDown(event) {
  if (!youtubePlayer.value || !isPlaying.value) return;
  isDragging.value = true;
  updateProgress(event);
}

function onProgressMouseMove(event) {
  if (!isDragging.value) return;
  updateProgress(event);
}

function onProgressMouseUp() {
  isDragging.value = false;
}

function updateProgress(event) {
  const progressBar = event.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percent = Math.max(0, Math.min(1, x / rect.width));
  const newTime = percent * duration.value;

  currentTime.value = newTime;
  if (youtubePlayer.value && youtubePlayer.value.seekTo) {
    youtubePlayer.value.seekTo(newTime, true);
  }
}

// Reset to preview when scrolling away
watch(
  () => route.params.slug,
  () => {
    resetToPreview();
  }
);

function resetToPreview() {
  if (!youtubePlayer.value) return;

  isPlaying.value = false;
  currentTime.value = 0;
  youtubePlayer.value.seekTo(0, true);
  youtubePlayer.value.mute();
  youtubePlayer.value.playVideo();
}

onMounted(() => {
  initYouTubeAPI();
  document.addEventListener("mousemove", onProgressMouseMove);
  document.addEventListener("mouseup", onProgressMouseUp);
});

onBeforeUnmount(() => {
  stopProgressTracking();

  if (apiCheckInterval) {
    clearInterval(apiCheckInterval);
    apiCheckInterval = null;
  }

  document.removeEventListener("mousemove", onProgressMouseMove);
  document.removeEventListener("mouseup", onProgressMouseUp);

  if (youtubePlayer.value && youtubePlayer.value.destroy) {
    youtubePlayer.value.destroy();
  }
});
</script>

<template>
  <article class="music-detail">
    <!-- Mobile: Full screen video + side controls -->
    <template v-if="isMobile">
      <div class="md-mobile-container">
        <div class="md-video-section">
          <div class="md-video-wrap">
            <div v-if="project?.videoId" :id="iframeId" class="md-video-iframe"></div>

            <!-- Overlay trasparente per intercettare tap -->
            <div class="md-video-overlay" @click="toggleVideoPlay"></div>

            <!-- Progress bar (shown when playing) -->
            <Transition name="progress-fade">
              <div v-if="isPlaying" class="md-progress-container">
                <div class="md-progress-bar" @mousedown="onProgressMouseDown">
                  <div class="md-progress-track">
                    <div
                      class="md-progress-fill"
                      :style="{ width: `${progressPercent}%` }"
                    ></div>
                    <div
                      class="md-progress-handle"
                      :style="{ left: `${progressPercent}%` }"
                    ></div>
                  </div>
                  <div class="md-progress-time">
                    {{ currentTimeFormatted }} / {{ durationFormatted }}
                  </div>
                </div>

                <!-- Listen on button -->
                <button
                  v-if="listenPlatform"
                  class="md-listen-btn"
                  @click.stop="openListenLink"
                  type="button"
                  :aria-label="`Listen on ${listenPlatform.name}`"
                >
                  Ascolta su {{ listenPlatform.name }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Play button area (shown in preview mode) -->
          <Transition name="play-btn-fade">
            <div v-if="!isPlaying" class="md-play-area">
              <button
                class="md-play-btn"
                @click="toggleVideoPlay"
                type="button"
                aria-label="Play video"
              >
                <font-awesome-icon icon="fa-solid fa-play" aria-hidden="true" />
              </button>
            </div>
          </Transition>
        </div>

        <!-- Side controls column (right) - Mobile -->
        <div class="md-side-controls">
          <!-- Spotify bubble -->
          <button
            class="md-control-btn md-control-spotify"
            @click.stop="
              () =>
                window.open(
                  'https://open.spotify.com/artist/6Tqf2cvcNjPdTVjuxynWEB?si=6Ig-mVObTReE7qo_8nB8_w',
                  '_blank'
                )
            "
            type="button"
            aria-label="Open Spotify Profile"
          >
            <font-awesome-icon icon="fa-brands fa-spotify" aria-hidden="true" />
          </button>

          <!-- YouTube bubble -->
          <button
            class="md-control-btn md-control-youtube"
            @click.stop="
              () =>
                window.open(
                  'https://youtube.com/@ex.raehmm?si=51oFIqEIh9faCtA0',
                  '_blank'
                )
            "
            type="button"
            aria-label="Open YouTube channel"
          >
            <font-awesome-icon icon="fa-brands fa-youtube" aria-hidden="true" />
          </button>

          <!-- Lyrics bubble (only show if lyrics exist) -->
          <button
            v-if="hasLyrics"
            class="md-control-btn md-control-lyrics"
            :class="{ active: showLyrics }"
            @click.stop="toggleLyrics"
            type="button"
            :aria-label="showLyrics ? 'Hide lyrics' : 'Show lyrics'"
            :aria-pressed="showLyrics"
          >
            <font-awesome-icon icon="fa-solid fa-bars" aria-hidden="true" />
          </button>
        </div>

        <!-- Lyrics overlay -->
        <Transition name="lyrics-overlay-fade">
          <div
            v-if="showLyrics"
            class="md-lyrics-overlay"
            role="region"
            aria-label="Song lyrics"
            @click="toggleLyrics"
          >
            <div class="md-lyrics-content" @click.stop>
              <button
                class="md-lyrics-close"
                @click="toggleLyrics"
                type="button"
                aria-label="Close lyrics"
              >
                <font-awesome-icon
                  icon="fa-solid fa-xmark"
                  aria-hidden="true"
                />
              </button>
              <h3 class="md-lyrics-title">{{ project?.title || "" }}</h3>
              <pre class="md-lyrics-text">{{ project?.lyrics || "" }}</pre>
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <!-- Desktop: Centered video + side controls -->
    <template v-else>
      <div class="md-desktop-container">
        <div class="md-video-section">
          <div class="md-video-wrap">
            <div v-if="project?.videoId" :id="iframeId" class="md-video-iframe"></div>

            <!-- Overlay trasparente per intercettare tap -->
            <div class="md-video-overlay" @click="toggleVideoPlay"></div>

            <!-- Progress bar (shown when playing) - Desktop -->
            <Transition name="progress-fade">
              <div
                v-if="isPlaying"
                class="md-progress-container md-progress-container--desktop"
              >
                <div class="md-progress-bar" @mousedown="onProgressMouseDown">
                  <div class="md-progress-track">
                    <div
                      class="md-progress-fill"
                      :style="{ width: `${progressPercent}%` }"
                    ></div>
                    <div
                      class="md-progress-handle"
                      :style="{ left: `${progressPercent}%` }"
                    ></div>
                  </div>
                  <div class="md-progress-time">
                    {{ currentTimeFormatted }} / {{ durationFormatted }}
                  </div>
                </div>

                <!-- Listen on button -->
                <button
                  v-if="listenPlatform"
                  class="md-listen-btn"
                  @click.stop="openListenLink"
                  type="button"
                  :aria-label="`Listen on ${listenPlatform.name}`"
                >
                  Ascolta su {{ listenPlatform.name }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Play button area (shown in preview mode) - Desktop -->
          <Transition name="play-btn-fade">
            <div v-if="!isPlaying" class="md-play-area">
              <button
                class="md-play-btn"
                @click="toggleVideoPlay"
                type="button"
                aria-label="Play video"
              >
                <font-awesome-icon icon="fa-solid fa-play" aria-hidden="true" />
              </button>
            </div>
          </Transition>
        </div>

        <!-- Side controls column (right) -->
        <div class="md-side-controls">
          <!-- Spotify bubble -->
          <button
            class="md-control-btn md-control-spotify"
            @click.stop="
              () =>
                window.open(
                  'https://open.spotify.com/artist/6Tqf2cvcNjPdTVjuxynWEB?si=6Ig-mVObTReE7qo_8nB8_w',
                  '_blank'
                )
            "
            type="button"
            aria-label="Open Spotify Profile"
          >
            <font-awesome-icon icon="fa-brands fa-spotify" aria-hidden="true" />
          </button>

          <!-- YouTube bubble -->
          <button
            class="md-control-btn md-control-youtube"
            @click.stop="
              () =>
                window.open(
                  'https://youtube.com/@ex.raehmm?si=51oFIqEIh9faCtA0',
                  '_blank'
                )
            "
            type="button"
            aria-label="Open YouTube channel"
          >
            <font-awesome-icon icon="fa-brands fa-youtube" aria-hidden="true" />
          </button>

          <!-- Lyrics bubble (only show if lyrics exist) -->
          <button
            v-if="hasLyrics"
            class="md-control-btn md-control-lyrics"
            :class="{ active: showLyrics }"
            @click.stop="toggleLyrics"
            type="button"
            :aria-label="showLyrics ? 'Hide lyrics' : 'Show lyrics'"
            :aria-pressed="showLyrics"
          >
            <font-awesome-icon icon="fa-solid fa-bars" aria-hidden="true" />
          </button>
        </div>

        <!-- Lyrics panel (desktop - slide from right) -->
        <Transition name="lyrics-panel-slide">
          <aside
            v-if="showLyrics"
            class="md-lyrics-panel"
            role="region"
            aria-label="Song lyrics"
          >
            <button
              class="md-lyrics-close"
              @click="toggleLyrics"
              type="button"
              aria-label="Close lyrics"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <h3 class="md-lyrics-title">{{ project?.title || "" }}</h3>
            <pre class="md-lyrics-text">{{ project?.lyrics || "" }}</pre>
          </aside>
        </Transition>
      </div>
    </template>
  </article>
</template>

<style scoped lang="scss">
@use "@/style/components/music-detail";
</style>
