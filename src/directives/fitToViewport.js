function computeScale(wrapper, content, mode = "contain") {
  const wb = wrapper.getBoundingClientRect();
  const cb = content.getBoundingClientRect();
  if (!wb.width || !wb.height || !cb.width || !cb.height) return 1;
  const sx = wb.width / cb.width;
  const sy = wb.height / cb.height;
  return mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
}

function applyScale(content, s) {
  content.style.transform = `scale(${s})`;
  content.style.transformOrigin = "center center";
}

export default {
  mounted(el, binding) {
    // binding.value?.mode: "contain" | "cover"
    const mode = binding?.value?.mode || "contain";
    const stage = el.querySelector(".vf-stage");
    const wrap = el.querySelector(".vf-wrap");
    if (!stage || !wrap) return;

    const fit = () => applyScale(wrap, computeScale(stage, wrap, mode));
    el.__fit = { fit, ro: new ResizeObserver(fit) };
    el.__fit.ro.observe(stage);
    el.__fit.ro.observe(wrap);
    wrap
      .querySelectorAll("img")
      .forEach((img) => img.addEventListener("load", fit, { once: true }));
    requestAnimationFrame(fit);
    window.addEventListener("orientationchange", fit);
    window.addEventListener("resize", fit);
  },
  unmounted(el) {
    const f = el.__fit;
    if (!f) return;
    f.ro.disconnect();
    window.removeEventListener("orientationchange", f.fit);
    window.removeEventListener("resize", f.fit);
    delete el.__fit;
  },
};
