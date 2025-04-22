<script setup>
import Logo from "@/assets/logo/Logo.vue";
</script>
<template>
  <div class="video">
    <video autoplay muted loop playsinline class="video-bg">
      <source src="@/assets/media/video/hero.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="overlay"></div>
  <div class="contentContainer">
    <div class="heroTitile">
      <Logo color="cool" background="transparent" />
      <h1 class="title">RÆHM</h1>
    </div>
    <div class="heroText">
      <p class="bio">
        <b>Art as a threshold — between matter and symbol, presence and echo.</b>
        <br />
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
</template>
