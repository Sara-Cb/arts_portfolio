<template>
  <div class="ouroboros-loader">
    <svg
      class="ouroboros-svg"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Corpo del serpente - cerchio principale -->
      <path
        class="ouroboros-body"
        d="M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />

      <!-- Testa del serpente -->
      <g class="ouroboros-head">
        <circle cx="50" cy="10" r="4" fill="currentColor" />
        <path
          d="M48,8 Q50,5 52,8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </g>

      <!-- Coda del serpente -->
      <g class="ouroboros-tail">
        <path
          d="M50,90 L48,94 L50,92 L52,94 Z"
          fill="currentColor"
        />
      </g>

      <!-- Dettagli scaglie (opzionale) -->
      <circle class="scale" cx="35" cy="20" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="25" cy="35" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="20" cy="50" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="25" cy="65" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="35" cy="80" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="50" cy="85" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="65" cy="80" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="75" cy="65" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="80" cy="50" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="75" cy="35" r="1" fill="currentColor" opacity="0.6" />
      <circle class="scale" cx="65" cy="20" r="1" fill="currentColor" opacity="0.6" />
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
  background: rgba($night, 0.7);
  backdrop-filter: blur(8px);
  z-index: 5;
}

.ouroboros-svg {
  width: 80px;
  height: 80px;
  color: $ghost;
  animation: rotate 3s linear infinite;
}

.ouroboros-body {
  stroke-dasharray: 251; /* Circonferenza del cerchio */
  stroke-dashoffset: 251;
  animation: draw 2s ease-in-out infinite;
}

.ouroboros-head {
  animation: pulse 2s ease-in-out infinite;
}

.scale {
  animation: fade 2s ease-in-out infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes draw {
  0%, 100% {
    stroke-dashoffset: 251;
  }
  50% {
    stroke-dashoffset: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes fade {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.2;
  }
}
</style>
