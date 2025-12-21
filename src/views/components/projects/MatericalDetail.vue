<script setup>
import { computed } from "vue";
import { chooseLayout } from "@/lib/layoutChooser";

const props = defineProps({ project: { type: Object, required: true } });

const gallery = computed(
  () => props.project.gallery || { cover: null, items: [] }
);
const isReady = computed(
  () => Array.isArray(gallery.value.items) && gallery.value.items.length > 0
);

const textBlock = computed(() => {
  const mats = Array.isArray(props.project.materials)
    ? props.project.materials.filter(Boolean).join(", ")
    : props.project.materials || "";
  const desc = props.project.description || "";
  if (!mats && !desc) return null;
  const html = `
    <div class="md-meta">
      ${
        mats
          ? `<p class="md-materials"><strong>materiali</strong><br>${mats}</p>`
          : ""
      }
      ${desc ? `<p class="md-description">${desc}</p>` : ""}
    </div>`;
  return { html, size: "md" };
});

const layout = computed(() =>
  isReady.value
    ? chooseLayout(props.project.id, gallery.value.items, {
        textBlock: textBlock.value,
      })
    : { name: "empty", slots: [] }
);
</script>

<template>
  <article class="materical-detail">
    <div class="md-head">
      <h2 class="md-title">{{ project.title }}</h2>
      <p v-if="project.subtitle" class="md-sub">{{ project.subtitle }}</p>
    </div>

    <div v-if="!isReady" class="md-skeleton">
      <div class="sk-hero"></div>
      <div class="sk-row"></div>
      <div class="sk-row"></div>
    </div>

    <template v-else>
      <section
        v-for="(slot, idx) in layout.slots"
        :key="idx"
        :class="['md-slot', slot.kind]"
      >
        <div class="vf-wrap">
          <template v-for="img in slot.images" :key="img.url || img.text">
            <img
              v-if="img.kind !== 'text'"
              :src="img.url"
              :alt="img.alt"
              :class="img.classes"
              :style="img.style"
              loading="lazy"
              decoding="async"
            />
            <div
              v-else
              :class="img.classes"
              :style="img.style"
              v-html="img.html"
            />
          </template>
        </div>
      </section>
    </template>
  </article>
</template>

<style scoped>
.md-skeleton .sk-hero {
  height: 42vh;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  margin-bottom: 1rem;
}
.md-skeleton .sk-row {
  height: 28vh;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 0.75rem;
}
</style>
