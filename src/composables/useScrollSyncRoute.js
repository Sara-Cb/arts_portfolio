import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

export function useScrollSyncRoute(sectionIds, routeNames) {
  const router = useRouter();
  let observer;

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionIds.indexOf(entry.target.id);
            router.replace({ name: routeNames[idx] });
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  });

  onBeforeUnmount(() => observer.disconnect());
}
