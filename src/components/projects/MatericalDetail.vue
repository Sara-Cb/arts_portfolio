<script setup>
import { computed } from "vue";
import { chooseLayout } from "@/lib/layoutChooser";
import { useGalleryStore } from "@/stores/gallery";
import { useEnvironmentStore } from "@/stores/environment";
import InlineGallery from "@/components/projects/InlineGallery.vue";

const props = defineProps({ project: { type: Object, required: true } });
const galleryStore = useGalleryStore();
const env = useEnvironmentStore();

const isMobile = computed(() => env.width < 576);

const gallery = computed(
  () => props.project.gallery || { cover: null, items: [] }
);
const isReady = computed(
  () => Array.isArray(gallery.value.items) && gallery.value.items.length > 0
);

const materialsString = computed(() => {
  return Array.isArray(props.project.materials)
    ? props.project.materials.filter(Boolean).join(", ")
    : props.project.materials || "";
});

const textBlock = computed(() => {
  const mats = materialsString.value;
  const desc = props.project.description || "";
  const date = props.project.date || "";
  if (!mats && !desc && !date) return null;
  const html = `
    <div class="md-meta">
      ${desc ? `<p class="md-description">${desc}</p>` : ""}
      ${mats ? `<p class="md-materials">${mats}</p>` : ""}
      ${date ? `<p class="md-date">${date}</p>` : ""}
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

function openGallery(clickedImage) {
  // Su mobile non apriamo la lightbox
  if (isMobile.value) return;

  if (!isReady.value || clickedImage.kind === "text") return;

  const imageIndex = gallery.value.items.findIndex(
    (img) => img.url === clickedImage.url
  );

  const materials = Array.isArray(props.project.materials)
    ? props.project.materials.filter(Boolean).join(", ")
    : props.project.materials || "";

  galleryStore.openGallery(
    gallery.value.items,
    imageIndex >= 0 ? imageIndex : 0,
    {
      title: props.project.title,
      materials: materials,
      description: props.project.description || "",
    }
  );
}
</script>

<template>
  <article class="materical-detail">
    <!-- Mobile: InlineGallery -->
    <template v-if="isMobile">
      <div v-if="!isReady" class="md-skeleton">
        <div class="sk-hero"></div>
        <div class="sk-row"></div>
      </div>

      <InlineGallery
        v-else
        :images="gallery.items"
        :project-title="project.title"
        :project-materials="materialsString"
        :project-description="project.description || ''"
      />
    </template>

    <!-- Desktop: Layout a griglia -->
    <template v-else>
      <div class="md-head">
        <h2 class="md-title" tabindex="0" :aria-label="`Project: ${project.title}`">{{ project.title }}</h2>
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
              <button
                v-if="img.kind !== 'text'"
                type="button"
                class="md-image-button"
                :style="img.style"
                @click="openGallery(img)"
                :aria-label="`View ${img.alt} in full screen gallery`"
              >
                <img
                  v-image-loader
                  :src="img.url"
                  :alt="img.alt"
                  :class="img.classes"
                  loading="lazy"
                  decoding="async"
                />
              </button>
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
    </template>
  </article>
</template>
