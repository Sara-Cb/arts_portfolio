<script setup>
import { ref } from "vue";
import Logo from "@/assets/logo/Logo.vue";

const isVideoLoaded = ref(false);
const showNavigationHint = ref(false);
let hintTimeout = null;

function onVideoLoaded() {
  isVideoLoaded.value = true;
}

function onTitleFocus() {
  showNavigationHint.value = true;
  if (hintTimeout) clearTimeout(hintTimeout);
  hintTimeout = setTimeout(() => {
    showNavigationHint.value = false;
  }, 2000);
}

function onTitleBlur() {
  if (hintTimeout) clearTimeout(hintTimeout);
  showNavigationHint.value = false;
}
</script>

<template>
  <section id="hero" class="sectionInner">
    <div class="video" :class="{ loaded: isVideoLoaded }" role="img" aria-label="Abstract artistic background animation">
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
        <source src="@/assets/media/video/hero.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="overlay"></div>
    <div class="contentContainer">
      <div class="heroTitle">
        <Logo color="cool" background="transparent" />
        <h1
          class="title"
          tabindex="0"
          aria-label="Raehm - Artist portfolio"
          @focus="onTitleFocus"
          @blur="onTitleBlur"
        >RÆHM</h1>
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

      <!-- Navigation hint -->
      <Transition name="fade">
        <div v-if="showNavigationHint" class="navigation-hint" aria-live="polite">
          Use arrow keys to navigate sections
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "@/style/partials/colors" as *;

// Hide focus outline on hero title
.title:focus,
.title:focus-visible {
  outline: none !important;
}

// Navigation hint
.navigation-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: $cool;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  z-index: 100;
  border: 1px solid $cool-trans-30;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
