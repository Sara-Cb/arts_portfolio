<script setup>
import { onMounted } from "vue";

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <div class="page privacy-page">
    <section class="snapSection">
      <div class="privacy-container">
        <h1 class="privacy-title">Privacy Policy & Content Notice</h1>

        <div class="privacy-content">
          <section class="privacy-section">
            <h2>Content Warning</h2>
            <p>
              This portfolio showcases artistic works created for creative, educational,
              and representational purposes. The content displayed on this website includes:
            </p>
            <ul>
              <li>Artistic nudity and explicit imagery</li>
              <li>Mature and provocative themes</li>
              <li>Content that may be considered disturbing or sensitive</li>
            </ul>
            <p>
              All works are presented in an artistic context and are intended for mature
              audiences (18+ years of age). By accessing this site, you confirm that you
              are of legal age in your jurisdiction to view such content.
            </p>
          </section>

          <section class="privacy-section">
            <h2>Artistic Purpose</h2>
            <p>
              The artworks featured in this portfolio are created for artistic expression,
              cultural commentary, and creative exploration. They are not intended to
              offend, exploit, or promote any harmful activities. All works are protected
              by copyright and are displayed for portfolio and exhibition purposes.
            </p>
            <p>
              The artistic nudity and mature themes present in these works serve as vehicles
              for exploring concepts of identity, vulnerability, societal critique, and
              human condition. They are representative of contemporary artistic practice
              and should be interpreted within this context.
            </p>
          </section>

          <section class="privacy-section">
            <h2>Data Collection & Privacy</h2>
            <p>
              This website respects your privacy and collects minimal data:
            </p>
            <ul>
              <li>
                <strong>Age Gate Acceptance:</strong> We store your consent to view mature
                content locally in your browser (localStorage) to prevent repeated warnings.
              </li>
              <li>
                <strong>No Personal Data:</strong> We do not collect, store, or share any
                personal information, email addresses, or identifying data.
              </li>
              <li>
                <strong>No Cookies:</strong> This site does not use tracking cookies or
                third-party analytics.
              </li>
            </ul>
          </section>

          <section class="privacy-section">
            <h2>Copyright & Usage</h2>
            <p>
              All artworks, photographs, and content displayed on this website are
              copyright-protected and owned by the artist. Unauthorized reproduction,
              distribution, or commercial use is strictly prohibited without explicit
              written permission.
            </p>
          </section>

          <section class="privacy-section">
            <h2>Contact</h2>
            <p>
              If you have questions, concerns, or would like to report content, please
              contact us through the appropriate channels. We take content concerns
              seriously and will respond to legitimate inquiries.
            </p>
          </section>

          <section class="privacy-section privacy-footer">
            <p class="privacy-date">Last updated: December 2024</p>
            <router-link to="/" class="privacy-link">← Back to Portfolio</router-link>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use "@/style/partials/colors" as *;
@use "@/style/partials/typography" as *;
@use "@/style/partials/variables" as *;

.privacy-page {
  background-color: $background-color;
}

.privacy-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;

  @media (max-width: 575px) {
    padding: 2rem 1.5rem;
  }
}

.privacy-title {
  font-family: $font-family-heading;
  font-size: 2.5rem;
  color: $ghost;
  margin: 0 0 2rem 0;
  letter-spacing: 0.02em;

  @media (max-width: 575px) {
    font-size: 1.8rem;
  }
}

.privacy-content {
  color: rgba($ghost, 0.9);
}

.privacy-section {
  margin-bottom: 2.5rem;

  h2 {
    font-family: $font-family-heading;
    font-size: 1.5rem;
    color: $ghost;
    margin: 0 0 1rem 0;
    letter-spacing: 0.02em;
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    margin: 0 0 1rem 0;
    color: rgba($ghost, 0.85);
  }

  ul {
    margin: 1rem 0 1rem 1.5rem;
    padding: 0;
    list-style: disc;

    li {
      font-size: 0.95rem;
      line-height: 1.8;
      margin-bottom: 0.5rem;
      color: rgba($ghost, 0.8);

      strong {
        color: $ghost;
      }
    }
  }
}

.privacy-footer {
  border-top: 1px solid rgba($ghost, 0.1);
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 575px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.privacy-date {
  font-size: 0.9rem;
  opacity: 0.6;
  margin: 0;
}

.privacy-link {
  color: $ghost;
  text-decoration: none;
  font-family: $font-family-heading;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
}
</style>
