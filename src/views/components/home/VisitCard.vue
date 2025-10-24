<script setup>
import Logo from "@/assets/logo/Logo.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <section id="visitCard" class="snapSection">
    <div class="mirror">
      <div class="contentContainer">
        <div class="profile">
          <Logo color="chocolate" background="ghost" />
        </div>
        <div class="names">
          <h2 class="alias">Ræhm</h2>
          <h4 class="name">Marco Campobasso</h4>
        </div>
      </div>
    </div>

    <div class="contacts">
      <div class="contentContainer">
        <div class="callToAction">
          <h6>Let's create new dimensions together.</h6>
        </div>
        <div class="contactList">
          <a class="contact" href="mailto:lab@raehm.com" target="_blank">
            <p class="info">lab@ræhm.com</p>
            <div class="icon">
              <FontAwesomeIcon :icon="['fas', 'envelope']" />
            </div>
          </a>
          <a class="contact" href="https://t.me/ExRaehm" target="_blank">
            <p class="info">Ex Ræhm</p>
            <div class="icon">
              <FontAwesomeIcon :icon="['fab', 'telegram']" />
            </div>
          </a>
          <a
            class="contact"
            href="https://www.instagram.com/ex.raehm/"
            target="_blank"
          >
            <p class="info">@ex.ræhm</p>
            <div class="icon">
              <FontAwesomeIcon :icon="['fab', 'instagram']" />
            </div>
          </a>
          <a
            class="contact"
            href="https://open.spotify.com/intl-it/artist/6ivgRDsZOfEQ8z287GAsF1?si=3GK1cbiySaKik1wrHQSndw"
            target="_blank"
          >
            <p class="info">Ræhm</p>
            <div class="icon">
              <FontAwesomeIcon :icon="['fab', 'spotify']" />
            </div>
          </a>
          <a
            class="contact"
            href="https://youtube.com/@ex.raehmm?si=51oFIqEIh9faCtA0"
            target="_blank"
          >
            <p class="info">ex.ræhm</p>
            <div class="icon">
              <FontAwesomeIcon :icon="['fab', 'youtube']" />
            </div>
          </a>
        </div>
        <!--
            <a class="contact" href="https://www.linkedin.com/in/marco-campobasso-0806bb294/" target="_blank" >
              <p class="info">Marco Campobasso</p>
              <div class="icon"><FontAwesomeIcon :icon="['fab', 'linkedin']" /></div>
            </a>
            -->
      </div>
    </div>
    <footer class="footer">
      <div class="contentContainer">
        <span>© 2025 Ræhm. All rights reserved.</span>
        <span class="madeBy">
          Made with love by
          <a class="sara" href="https://github.com/Sara-Cb/" target="_blank"
            >sara.cb</a
          >
        </span>
      </div>
    </footer>
  </section>
</template>
