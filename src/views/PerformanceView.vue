<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import { useSeo } from "@/composables/useSeo";
import PerformanceDetail from "@/components/projects/PerformanceDetail.vue";

const ui = useUiStore();
const projectsStore = useProjectsStore();
const route = useRoute();
const projects = computed(() => projectsStore.getByCategory("performance"));

// SEO per performance (work in progress)
useSeo({
  title: "Performance | Ræhm",
  description: "Performance art works by Ræhm. Coming soon. Mature content (18+).",
  keywords: ["performance art", "contemporary performance", "live art", "body art"],
});

// Genera ID sezione
function sectionId(slug) {
  return `performance-project-${slug}`.replace(/[^a-z0-9_-]+/gi, "-");
}

onMounted(async () => {
  await projectsStore.ensureLoaded();
  ui.setSectionList("performance", [
    { name: "performance" },
    ...projects.value.map((p) => ({
      name: "performance-project",
      params: { slug: p.slug },
    })),
  ]);
});
</script>

<template>
  <div class="page page--projects" id="performance">
    <section class="snapSection" id="performance" data-route="performance">
      <div class="wip-container">
        <h1>Performance</h1>
        <p class="wip-message">Work in progress...</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use "@/style/partials/colors" as *;
@use "@/style/partials/variables" as *;

.wip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  gap: 1.5rem;
  padding: 1rem;

  h1 {
    font-size: 2.5rem;
    color: $ghost;
    text-align: center;
  }

  .wip-message {
    font-size: 1.2rem;
    color: $cool;
    font-style: italic;
    text-align: center;
  }

  @media screen and (min-width: $breakpoint-sm) {
    gap: 2rem;

    h1 {
      font-size: 3.5rem;
    }

    .wip-message {
      font-size: 1.4rem;
    }
  }

  @media screen and (min-width: $breakpoint-md) {
    h1 {
      font-size: 4rem;
    }

    .wip-message {
      font-size: 1.5rem;
    }
  }
}
</style>
