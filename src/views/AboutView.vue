<script setup>

</script>

<template>
    <div class="pageContainer">
        <h1>About Raehm</h1>
        <div class="hero">
            <div class="foto">
                <img src="@/assets/imgs/profile.jpg" alt="Raehm">
            </div>
            <div class="bio">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum aut cupiditate amet ratione
                adipisci eaque molestias, enim qui! Et beatae suscipit laborum possimus alias vitae maiores fuga nostrum
                minus sequi.</div>
        </div>
        <div class="contacts">
            <h3>Contact Me</h3>
            <a class="contact" href="mailto:lab@raehm.com" target="_blank">
                <div class="icon"><font-awesome-icon :icon="['fas', 'envelope']" /></div>
                <p class="info">lab@raehm.com</p>
            </a>
            <a class="contact" href="https://wa.me/393339004592" target="_blank">
                <div class="icon"><font-awesome-icon :icon="['fas', 'phone']" /></div>
                <p class="info">+39 3339004592</p>
            </a>
            <a class="contact" href="https://www.instagram.com/ex.raehm/" target="_blank">
                <div class="icon"><font-awesome-icon :icon="['fab', 'instagram']" /></div>
                <p class="info">@ex.raehm</p>
            </a>
            <!--
            <a class="contact" href="https://www.linkedin.com/in/marco-campobasso-0806bb294/" target="_blank" >
                <div class="icon"><font-awesome-icon :icon="['fab', 'linkedin']" /></div>
                <p class="info">Marco Campobasso</p>
            </a>
            -->
        </div>
    </div>
</template>
