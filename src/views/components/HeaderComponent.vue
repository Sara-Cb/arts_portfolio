<script setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useEnvironmentStore } from "@/stores/environment";
import { useUiStore } from "@/stores/ui";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";
import { useNavigator } from "@/composables/useNavigator"; // 👈 nuovo
import Logo from "@/assets/logo/Logo.vue";
import Player from "@/views/components/player/Player.vue";

const { isMobile } = storeToRefs(useEnvironmentStore());
const route = useRoute();
const ui = useUiStore();
const { navigateTo } = useNavigator();

const pageKey = computed(
  () => ui.findPageKeyForRoute(route.name, route.params) || null
);

const { pushToEntry, sectionId } = useVerticalNavigator({
  pageKey,
  containerSelector: ".page",
  keydownEnabled: false,
});

async function goHomeSection(name) {
  const entry = { name };
  if (pageKey.value === "rahem") {
    pushToEntry(entry);
    requestAnimationFrame(() => {
      const id = sectionId(entry);
      document
        .querySelector(`.page#home > .snapSection#${id}`)
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  } else {
    await navigateTo(name, {}, { instantHome: true });
  }
}
</script>

<template>
  <header :class="{ mobile: isMobile }">
    <div class="contentContainer">
      <button
        class="logo"
        type="button"
        @click="goHomeSection('rahem')"
        aria-label="Home"
      >
        <Logo color="ghost" background="transparent" />
      </button>

      <nav class="navMenu" aria-label="Home sections">
        <ul>
          <li>
            <button
              class="navLink"
              type="button"
              @click="goHomeSection('rahem')"
              aria-label="Hero"
            >
              <FontAwesomeIcon :icon="['fas', 'home']" />
            </button>
          </li>
          <li>
            <button
              class="navLink"
              type="button"
              @click="goHomeSection('projects')"
              aria-label="Projects"
            >
              <FontAwesomeIcon :icon="['fas', 'folder']" />
            </button>
          </li>
          <li>
            <button
              class="navLink"
              type="button"
              @click="goHomeSection('visit-card')"
              aria-label="Visit card"
            >
              <FontAwesomeIcon :icon="['fas', 'address-card']" />
            </button>
          </li>
        </ul>
      </nav>

      <div class="playerMenu">
        <Player />
      </div>
    </div>
  </header>
</template>
