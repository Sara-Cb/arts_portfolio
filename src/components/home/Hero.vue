<script setup>
import { ref } from "vue";
import Logo from "@/assets/logo/Logo.vue";

const isVideoLoaded = ref(false);

function onVideoLoaded() {
  isVideoLoaded.value = true;
}
</script>

<template>
  <section id="hero" class="sectionInner">
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
        <source src="@/assets/media/video/hero.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="overlay"></div>
    <div class="contentContainer">
      <div class="heroTitle">
        <Logo color="cool" background="transparent" />
        <h1 class="title">RÆHM</h1>
      </div>
      <div class="heroText">
        <p class="bio">
          <b
            >Art as a threshold — between matter and symbol, presence and
            echo.</b
          >
          Explorations of transformation through texture, image, and movement.
          <br />
          Fragments, gestures, and rituals emerge — cryptic, sensorial, and
          transformative.
          <br />
          Works that invite silence, tension, and the unfolding of unseen
          dimensions.
        </p>
      </div>
    </div>
  </section>
</template>
