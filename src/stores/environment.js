// stores/environment.js
import { defineStore } from "pinia";
import { ref, onMounted } from "vue";

export const useEnvironmentStore = defineStore("environment", () => {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);
  const isTouch = ref(false);
  const isMobile = ref(false);

  const updateDimensions = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    isMobile.value = width.value <= 768; // puoi tarare questa soglia
  };

  onMounted(() => {
    updateDimensions();
    isTouch.value = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    window.addEventListener("resize", updateDimensions);
  });

  return { width, height, isTouch, isMobile };
});
