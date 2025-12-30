<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import MusicDetail from "@/components/projects/MusicDetail.vue";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";

const ui = useUiStore();
const projectsStore = useProjectsStore();

const projects = computed(() => projectsStore.musics);

// Music projects are ready when loaded (no gallery dependency)
const isReady = computed(
  () => projectsStore.loaded && projects.value.length > 0
);

// Genera ID sezione (stesso pattern di useVerticalNavigator)
function sectionId(slug) {
  return `music-project-${slug}`.replace(/[^a-z0-9_-]+/gi, "-");
}

onMounted(async () => {
  await projectsStore.ensureLoaded();
  ui.setSectionList(
    "music",
    projects.value.map((p) => ({
      name: "music-project",
      params: { slug: p.slug },
    }))
  );
});

useVerticalNavigator({
  pageKey: "music",
  containerSelector: ".page#music",
  keydownEnabled: true,
  initialAlignFirst: true,
  ioThreshold: 0.6,
  debug: false,
});
</script>

<template>
  <div class="page page--projects" id="music">
    <!-- LOADER a snap finché non caricato -->
    <template v-if="!isReady">
      <section v-for="n in 3" :key="n" class="snapSection">
        <div class="music-skeleton">
          <div class="sk-video"></div>
        </div>
      </section>
    </template>

    <!-- CONTENUTO quando pronto -->
    <template v-else>
      <section
        v-for="p in projects"
        :key="p.slug"
        class="snapSection"
        :id="sectionId(p.slug)"
        :data-slug="p.slug"
      >
        <MusicDetail :project="p" />
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use "@/style/partials/colors" as *;

.music-skeleton {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  .sk-video {
    width: min(1200px, 70vw);
    aspect-ratio: 16 / 9;
    border-radius: 16px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 25%,
      rgba(255, 255, 255, 0.1) 37%,
      rgba(255, 255, 255, 0.06) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.1s infinite linear;
  }
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 575px) {
  .music-skeleton {
    padding: 0;

    .sk-video {
      width: 100%;
      aspect-ratio: 9 / 16;
      border-radius: 0;
    }
  }
}
</style>
