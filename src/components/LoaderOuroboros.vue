<template>
  <div class="ouroboros-loader">
    <svg
      class="ouroboros-svg"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Serpente Ouroboros semplificato - un cerchio che si morde la coda -->
      <circle
        class="ouroboros-circle"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-dasharray="125.6"
      />
      <!-- Testa -->
      <circle cx="25" cy="5" r="2.5" fill="currentColor" />
    </svg>
  </div>
</template>

<style scoped lang="scss">
@use "@/style/partials/colors" as *;

.ouroboros-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($night, 0.5);
  z-index: 5;
  will-change: opacity;
}

.ouroboros-svg {
  width: 48px;
  height: 48px;
  color: $ghost;
  will-change: transform;
  animation: spin 1.5s linear infinite;
}

.ouroboros-circle {
  stroke-dashoffset: 0;
  transform-origin: center;
  will-change: stroke-dashoffset;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 125.6;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -125.6;
  }
}
</style>
