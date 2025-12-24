<script setup>
import { computed } from "vue";
import { useGalleryStore } from "@/stores/gallery";
import { useEnvironmentStore } from "@/stores/environment";
import InlineGallery from "@/views/components/projects/InlineGallery.vue";

const props = defineProps({ project: { type: Object, required: true } });
const galleryStore = useGalleryStore();
const env = useEnvironmentStore();

const isMobile = computed(() => env.width < 576);

const gallery = computed(
  () => props.project?.gallery || { cover: null, items: [] }
);
const isReady = computed(
  () => Array.isArray(gallery.value.items) && gallery.value.items.length > 0
);

const hasVideos = computed(
  () => Array.isArray(props.project?.videos) && props.project.videos.length > 0
);

// Ordina immagini numericamente per filename
const sortedImages = computed(() => {
  if (!isReady.value) return [];

  return [...gallery.value.items].sort((a, b) => {
    const getNumber = (filename) => {
      const match = filename.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    return getNumber(a.filename) - getNumber(b.filename);
  });
});

function openGallery(clickedImage) {
  // Su mobile non apriamo la lightbox
  if (isMobile.value) return;

  if (!isReady.value) return;

  const imageIndex = sortedImages.value.findIndex(
    (img) => img.url === clickedImage.url
  );

  galleryStore.openGallery(
    sortedImages.value,
    imageIndex >= 0 ? imageIndex : 0,
    {
      title: props.project?.title || "",
      materials: "",
      description: props.project?.description || "",
    }
  );
}
</script>

<template>
  <article class="visual-detail">
    <!-- Mobile: InlineGallery -->
    <template v-if="isMobile">
      <div v-if="!isReady" class="vd-skeleton">
        <div class="sk-hero"></div>
        <div class="sk-row"></div>
      </div>

      <InlineGallery
        v-else
        :images="sortedImages"
        :project-title="project?.title || ''"
        :project-materials="''"
        :project-description="project?.description || ''"
      />
    </template>

    <!-- Desktop: Text left (20-25%), Image grid right (75-80%) -->
    <template v-else>
      <div class="vd-container">
        <!-- Left column: Text -->
        <aside class="vd-text-col">
          <div class="vd-text-content">
            <h2 class="vd-title">{{ project?.title || '' }}</h2>
            <p v-if="project?.subtitle" class="vd-subtitle">{{ project.subtitle }}</p>

            <p v-if="project?.description" class="vd-description">
              {{ project.description }}
            </p>
          </div>
        </aside>

        <!-- Right column: Image/Video grid -->
        <section class="vd-image-col">
          <div v-if="!isReady && !hasVideos" class="vd-skeleton">
            <div class="sk-hero"></div>
            <div class="sk-row"></div>
          </div>

          <div v-else class="vd-grid">
            <!-- Videos -->
            <video
              v-for="(video, idx) in project?.videos || []"
              :key="`video-${idx}`"
              :src="video"
              class="vd-grid-video"
              controls
              preload="metadata"
            >
              Il tuo browser non supporta il tag video.
            </video>

            <!-- Images -->
            <img
              v-for="img in sortedImages"
              :key="img.url"
              v-image-loader
              :src="img.url"
              :alt="project?.title || ''"
              class="vd-grid-image"
              loading="lazy"
              decoding="async"
              @click="openGallery(img)"
            />
          </div>
        </section>
      </div>
    </template>
  </article>
</template>

<style scoped lang="scss">
@use "@/style/components/visual-detail";
</style>
