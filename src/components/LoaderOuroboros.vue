<template>
  <div class="ouroboros-loader">
    <svg
      class="ouroboros-svg"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Serpente Ouroboros - cerchio che si morde la coda -->
      <g class="ouroboros-body">
        <!-- Corpo del serpente (arco incompleto) -->
        <circle
          class="ouroboros-circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="120 125.6"
        />
        <!-- Testa che insegue la coda -->
        <circle class="ouroboros-head" cx="25" cy="5" r="2.5" fill="currentColor" />
      </g>
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
  backdrop-filter: blur(2px);
}

.ouroboros-svg {
  width: 48px;
  height: 48px;
  color: $ghost;
}

.ouroboros-body {
  transform-origin: center;
  will-change: transform;
  animation: rotate 2s linear infinite;
}

.ouroboros-circle {
  transform-origin: center;
}

.ouroboros-head {
  filter: drop-shadow(0 0 3px currentColor);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
