<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import { useEnvironmentStore } from "@/stores/environment";

const props = defineProps({
  currentCategory: { type: String, required: true },
});

const route = useRoute();
const projectsStore = useProjectsStore();
const env = useEnvironmentStore();

const isMobile = computed(() => env.width < 576);

// Ottieni il progetto corrente dalla route
const currentProject = computed(() => {
  if (!route.params.slug) return null;

  const category = props.currentCategory;
  if (category === "materical")
    return projectsStore.getMaterical(route.params.slug);
  if (category === "visual") return projectsStore.getVisual(route.params.slug);
  if (category === "performance")
    return projectsStore.getPerformance(route.params.slug);
  if (category === "music") return projectsStore.getMusic(route.params.slug);

  return null;
});

const ui = useUiStore();
const router = useRouter();

const categories = computed(() => ui.pageOrder.filter((n) => n !== "rahem"));

const current = computed(() =>
  categories.value.includes(props.currentCategory)
    ? props.currentCategory
    : categories.value[0]
);

const others = computed(() =>
  categories.value.filter((c) => c !== current.value)
);

const labelOf = (name) =>
  name ? name.charAt(0).toUpperCase() + name.slice(1) : "";

/* -------- transizione orizzontale fra view -------- */
function computeDirection(from, to) {
  const iFrom = ui.pageIndexOf(from);
  const iTo = ui.pageIndexOf(to);
  if (iFrom === -1 || iTo === -1) return "left";
  return iTo > iFrom ? "right" : "left";
}

async function goToCategory(targetName) {
  ui.setHorizontalDirection(computeDirection(current.value, targetName));
  ui.setCrossPageTransition(true);
  await router.push({ name: targetName });
  closeMenu();
}

/* -------- menù mobile (freccina → tendina) -------- */
const isOpen = ref(false);
const triggerRef = ref(null);
const menuRef = ref(null);

function toggleMenu() {
  isOpen.value = !isOpen.value;
}
function closeMenu() {
  isOpen.value = false;
}

function onKeydownTrigger(e) {
  if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
    e.preventDefault();
    isOpen.value = true;
    // focus primo elemento dopo il frame
    requestAnimationFrame(() => {
      const first = menuRef.value?.querySelector("button.pn-item");
      first?.focus();
    });
  }
}

function onKeydownMenu(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    closeMenu();
    triggerRef.value?.focus();
  }
}

function onClickOutside(e) {
  const withinTrigger = triggerRef.value?.contains(e.target);
  const withinMenu = menuRef.value?.contains(e.target);
  if (!withinTrigger && !withinMenu) closeMenu();
}

onMounted(() => document.addEventListener("pointerdown", onClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("pointerdown", onClickOutside)
);
</script>

<template>
  <nav class="projects-navbar" aria-label="Projects categories">
    <!-- Mobile: titolo progetto a sinistra, categoria + menu a destra -->
    <template v-if="isMobile && currentProject">
      <div class="pn-left">
        <h1 class="pn-project-title">{{ currentProject.title }}</h1>
      </div>

      <div class="pn-right-mobile">
        <span class="pn-category-label">{{ labelOf(current) }}</span>
        <button
          ref="triggerRef"
          class="pn-trigger"
          type="button"
          :aria-expanded="isOpen ? 'true' : 'false'"
          aria-haspopup="menu"
          aria-controls="pn-menu"
          @click="toggleMenu"
          @keydown="onKeydownTrigger"
        >
          <span class="sr-only">Apri menù categorie</span>
          <svg
            class="pn-chevron"
            :class="{ 'is-open': isOpen }"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M7 10l5 5 5-5" />
          </svg>
        </button>

        <transition name="pn-fade">
          <div
            v-if="isOpen"
            ref="menuRef"
            id="pn-menu"
            class="pn-popover"
            role="menu"
            @keydown="onKeydownMenu"
          >
            <button
              v-for="c in others"
              :key="c"
              type="button"
              class="pn-item"
              role="menuitem"
              @click="goToCategory(c)"
            >
              {{ labelOf(c) }}
            </button>
          </div>
        </transition>
      </div>
    </template>

    <!-- Desktop: layout originale -->
    <template v-else>
      <div class="pn-left">
        <h1 class="pn-current" :data-name="current">{{ labelOf(current) }}</h1>
      </div>

      <ul class="pn-right pn-desktop" role="list">
        <li v-for="c in others" :key="c">
          <button
            type="button"
            class="pn-link"
            :aria-label="`Vai a ${labelOf(c)}`"
            @click="goToCategory(c)"
          >
            {{ labelOf(c) }}
          </button>
        </li>
      </ul>
    </template>
  </nav>
</template>
