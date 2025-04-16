import { ref } from "vue";
import { defineStore } from "pinia";

export const useCategoriesStore = defineStore("categories", () => {
  const materical = {
    type: "materical",
    title: "Materical",
    subtitle: "Voids stuck in raw matter.",
    description:
      "Transformation, density, and silence — hands carve out dimensions.",
    cta: "Explore the works",
    src: "/images/cat_materical.jpg",
  };
  const visual = {
    type: "visual",
    title: "Visual",
    subtitle: "Fragments of visions.",
    description: "Dark moods, lost rituals, and the beauty of distortion.",
    cta: "See the stories",
    src: "/images/cat_visual.jpg",
  };
  const performance = {
    type: "performance",
    title: "Performance",
    subtitle: "Body, flame and rhythm — the now becomes spell.",
    description: "A celebration of chaos and liberation.",
    cta: "Enter the ritual",
    src: "/images/cat_performance.jpg",
  };
  const music = {
    type: "music",
    title: "Music",
    subtitle: "Rhythm that moves beneath perception.",
    description: "A ritual of vibration — echoing through the body and beyond.",
    cta: "Listen and dissolve",
    src: "/images/cat_music.jpg",
  };

  const categories = ref([materical, visual, performance, music]);

  return { categories };
});
