<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUiStore } from "@/stores/ui";

const props = defineProps({
  currentCategory: {
    type: String,
    required: true,
  },
});

const ui = useUiStore();
const router = useRouter();

// categorie da mostrare (escludo "rahem"/home)
const categories = computed(() => ui.pageOrder.filter((n) => n !== "rahem"));

// categoria corrente "normalizzata"
// (se per qualche motivo arriva qualcosa fuori lista, fallback alla prima)
const current = computed(() =>
  categories.value.includes(props.currentCategory)
    ? props.currentCategory
    : categories.value[0]
);

// le altre categorie
const others = computed(() =>
  categories.value.filter((c) => c !== current.value)
);

// capitalizzazione semplice: "materical" -> "Materical"
const labelOf = (name) =>
  name ? name.charAt(0).toUpperCase() + name.slice(1) : "";

// calcolo della direzione per la transizione orizzontale
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
}

function onMobileChange(e) {
  const val = e.target.value;
  if (val && val !== current.value) goToCategory(val);
}
</script>

<template>
  <nav class="projects-navbar" aria-label="Projects categories">
    <!-- sinistra: categoria corrente -->
    <div class="pn-left">
      <span class="pn-current" :data-name="current">
        {{ labelOf(current) }}
      </span>
    </div>

    <!-- destra desktop: link alle altre categorie -->
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

    <!-- mobile: tendina con freccina accanto al nome corrente -->
    <div class="pn-mobile">
      <label class="sr-only" for="pn-select">Seleziona categoria</label>
      <div class="pn-select-wrap">
        <!-- TODO: qui metterei solo la freccina, senza far vedere il valore attuale, c'è anche da stilizzare il menu a tendina-->
        <select id="pn-select" :value="current" @change="onMobileChange">
          <option :value="current">{{ labelOf(current) }}</option>
          <option v-for="c in others" :key="c" :value="c">
            {{ labelOf(c) }}
          </option>
        </select>
        <svg class="pn-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10l5 5 5-5" />
        </svg>
      </div>
    </div>
  </nav>
</template>
