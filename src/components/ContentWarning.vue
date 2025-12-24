<script setup>
import { ref, computed, onMounted } from "vue";

const STORAGE_KEY = "content-warning-accepted";

const isVisible = ref(false);
const ageConfirmed = ref(false);
const warningUnderstood = ref(false);

const canEnter = computed(() => ageConfirmed.value && warningUnderstood.value);

onMounted(() => {
  const hasAccepted = localStorage.getItem(STORAGE_KEY);
  if (!hasAccepted) {
    isVisible.value = true;
  }
});

function handleEnter() {
  if (!canEnter.value) return;
  localStorage.setItem(STORAGE_KEY, "true");
  isVisible.value = false;
}
</script>

<template>
  <Transition name="warning-fade">
    <div v-if="isVisible" class="content-warning-overlay">
      <div class="warning-modal">
        <div class="warning-header">
          <h1 class="warning-title">Content Warning</h1>
        </div>

        <div class="warning-body">
          <p class="warning-text">
            This portfolio contains artistic works that may include:
          </p>
          <ul class="warning-list">
            <li>Nudity and explicit imagery</li>
            <li>Disturbing or provocative themes</li>
            <li>Mature and sensitive content</li>
          </ul>
          <p class="warning-text warning-emphasis">
            By entering, you confirm that you understand the nature of these works
            and are of legal age to view such content in your jurisdiction.
          </p>

          <div class="warning-checkboxes">
            <label class="warning-checkbox">
              <input type="checkbox" v-model="ageConfirmed" />
              <span>I am 18 years of age or older</span>
            </label>
            <label class="warning-checkbox">
              <input type="checkbox" v-model="warningUnderstood" />
              <span>I understand and accept this warning</span>
            </label>
          </div>
        </div>

        <div class="warning-footer">
          <button
            class="warning-button"
            :class="{ disabled: !canEnter }"
            :disabled="!canEnter"
            @click="handleEnter"
          >
            Enter Portfolio
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use "@/style/partials/colors" as *;
@use "@/style/partials/typography" as *;

.content-warning-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.warning-modal {
  background: rgba($chocolate, 0.15);
  border: 1px solid rgba($ghost, 0.1);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  @media (max-width: 575px) {
    padding: 1.5rem;
    max-width: 95%;
  }
}

.warning-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.warning-title {
  font-family: $font-family-heading;
  font-size: 2rem;
  color: $ghost;
  margin: 0;
  letter-spacing: 0.05em;

  @media (max-width: 575px) {
    font-size: 1.5rem;
  }
}

.warning-body {
  margin-bottom: 2rem;
}

.warning-text {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba($ghost, 0.9);
  margin: 0 0 1rem 0;
}

.warning-list {
  margin: 1rem 0 1.5rem 1.5rem;
  padding: 0;
  list-style: disc;

  li {
    font-size: 0.95rem;
    line-height: 1.8;
    color: rgba($ghost, 0.85);
  }
}

.warning-emphasis {
  font-weight: 500;
  color: $ghost;
  border-left: 3px solid rgba($ghost, 0.3);
  padding-left: 1rem;
  margin-top: 1.5rem;
}

.warning-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.warning-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  color: rgba($ghost, 0.9);
  font-size: 0.95rem;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: $ghost;
  }

  &:hover {
    color: $ghost;
  }
}

.warning-footer {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba($ghost, 0.1);
}

.warning-button {
  font-family: $font-family-heading;
  font-size: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.9rem 2.5rem;
  background: $ghost;
  color: $background-color;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover:not(.disabled) {
    background: rgba($ghost, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($ghost, 0.3);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: rgba($ghost, 0.5);
  }

  @media (max-width: 575px) {
    width: 100%;
    padding: 1rem;
  }
}

// Transitions
.warning-fade-enter-active,
.warning-fade-leave-active {
  transition: opacity 0.4s ease;
}

.warning-fade-enter-from,
.warning-fade-leave-to {
  opacity: 0;
}

.warning-fade-enter-active .warning-modal {
  animation: modal-appear 0.4s ease;
}

@keyframes modal-appear {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
