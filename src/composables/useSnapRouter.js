// src/composables/useSnapRouter.js
import { onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUiStore } from "@/stores/ui";

export function useSnapRouter({
  pageKey,
  containerSelector,
  sectionSelector = ".snapSection",
  threshold = 0.75,
} = {}) {
  const route = useRoute();
  const router = useRouter();
  const ui = useUiStore();

  let observer = null;

  const entryToRoute = (e) => (typeof e === "object" ? e : { name: e });
  const sameParams = (a = {}, b = {}) => {
    const ak = Object.keys(a),
      bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => a[k] === b[k]);
  };
  const equalsRoute = (e, r) =>
    typeof e === "string"
      ? e === r.name
      : e?.name === r.name && sameParams(e.params, r.params);

  const readList = () => ui.getSectionList(pageKey) || [];

  const alignToRoute = async () => {
    await nextTick();
    const list = readList();
    const idx = list.findIndex((e) => equalsRoute(e, route));
    const el = document.querySelectorAll(
      `${containerSelector} > ${sectionSelector}`
    )[idx];
    if (el) el.scrollIntoView({ block: "start", behavior: "auto" });
  };

  const setupIO = () => {
    const rootEl = document.querySelector(containerSelector);
    const els = Array.from(
      document.querySelectorAll(`${containerSelector} > ${sectionSelector}`)
    );
    if (!rootEl || !els.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = els.indexOf(visible.target);
        if (idx < 0) return;

        const target = readList()[idx];
        if (!target) return;

        const r = entryToRoute(target);
        if (!equalsRoute(target, route)) router.replace(r);
      },
      { root: rootEl, threshold: [threshold] }
    );

    els.forEach((el) => observer.observe(el));
  };

  const cleanupIO = () => observer && observer.disconnect();

  onMounted(() => {
    setupIO();
    alignToRoute();
  });

  onBeforeUnmount(cleanupIO);

  // back/forward o click dots/navbar
  watch(() => route.fullPath, alignToRoute);
}
