<script setup>
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useEnvironmentStore } from "@/stores/environment";
import Logo from "@/assets/logo/Logo.vue";
import Player from "@/views/components/player/Player.vue";

const { isMobile } = storeToRefs(useEnvironmentStore());
</script>

<template>
  <header :class="{ mobile: isMobile }">
    <div class="contentContainer">
      <RouterLink class="logo" to="/">
        <Logo color="ghost" background="transparent" />
      </RouterLink>

      <nav class="navMenu">
        <ul>
          <li>
            <RouterLink to="/raehm" class="navLink">
              <FontAwesomeIcon :icon="['fas', 'home']" />
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/projects" class="navLink">
              <FontAwesomeIcon :icon="['fas', 'folder']" />
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/visit-card" class="navLink">
              <FontAwesomeIcon :icon="['fas', 'address-card']" />
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="playerMenu">
        <Player />
      </div>
    </div>
  </header>
</template>
