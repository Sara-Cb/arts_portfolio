<script setup>
import mainVideo from "@/assets/media/video/performance/main.mp4";

const props = defineProps({ project: { type: Object, required: true } });

function openVideo(videoUrl) {
  window.open(`${videoUrl}`, "_blank");
}

function openYoutubeProfile() {
  window.open("https://www.youtube.com/@ex.raehmm", "_blank");
}
</script>

<template>
  <!-- TYPE: video — schermata fullscreen con main.mp4 -->
  <div v-if="project.type === 'video'" class="pf-intro">
    <video
      class="pf-showreel"
      :src="mainVideo"
      autoplay
      muted
      loop
      playsinline
    />
    <div class="pf-intro-actions">
      <button
        class="pf-yt-btn"
        type="button"
        aria-label="View more on YouTube"
        @click="openYoutubeProfile"
      >
        <font-awesome-icon icon="fa-brands fa-youtube" aria-hidden="true" />
        view more on youtube
      </button>
    </div>
  </div>

  <!-- TYPE: grid — mosaico di video YouTube -->
  <div v-else-if="project.type === 'grid'" class="pf-grid-section">
    <div class="pf-grid">
      <button
        v-for="(item, i) in project.items"
        :key="i"
        class="pf-card"
        type="button"
        :aria-label="`Watch ${item.title} on YouTube`"
        @click="openVideo(`https://www.youtube.com/watch?v=${item.videoId}`)"
      >
        <img
          :src="`https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`"
          :alt="item.title"
          class="pf-card-thumb"
          loading="lazy"
        />
        <div class="pf-card-overlay" aria-hidden="true">
          <font-awesome-icon icon="fa-brands fa-youtube" class="pf-card-icon" />
          <span class="pf-card-title">{{ item.title }}</span>
        </div>
      </button>
    </div>

    <!-- Tasto YouTube: underbar su mobile, bottom-left assoluto su desktop -->
    <div class="pf-grid-actions">
      <button
        class="pf-yt-btn"
        type="button"
        aria-label="View more on YouTube"
        @click="openYoutubeProfile"
      >
        <font-awesome-icon icon="fa-brands fa-youtube" aria-hidden="true" />
        view more on youtube
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/style/components/performance";
</style>
