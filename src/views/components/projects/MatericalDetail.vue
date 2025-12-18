<script setup>
import { computed, onMounted } from "vue";
import { chooseLayout } from "@/lib/layoutChooser";

const props = defineProps({ project: { type: Object, required: true } });

const gallery = computed(
  () => props.project.gallery || { cover: null, items: [] }
);
const layout = computed(() =>
  chooseLayout(props.project.id, gallery.value.items)
);
onMounted(() => {
  console.log(props.project);
});
</script>

<template>
  <article class="materical-detail">
    <div class="md-head">
      <h2 class="md-title">{{ project.title }}</h2>
      <p v-if="project.subtitle" class="md-sub">{{ project.subtitle }}</p>
    </div>

    <img
      v-if="gallery.cover"
      :src="gallery.cover"
      :alt="`${project.title} — cover`"
      class="md-cover"
      loading="eager"
      decoding="async"
    />

    <section
      v-for="(slot, idx) in layout.slots"
      :key="idx"
      :class="['md-slot', slot.kind]"
    >
      <img
        v-for="img in slot.images"
        :key="img.url"
        :src="img.url"
        :alt="img.alt"
        loading="lazy"
        decoding="async"
      />
    </section>
  </article>
</template>
