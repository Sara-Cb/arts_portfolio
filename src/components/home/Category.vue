<script setup>
const props = defineProps({
    name: {
        type: String,
        default: ''
    },
    img: {
        type: String,
        default: ''
    }
})

</script>

<template>
    <RouterLink class="category" :class="props.name.toLowerCase()" :to="'/projects/' + props.name">
        <div class="img"><img :src="props.img" alt="photo"></div>
        <h5 class="label">{{ props.name }}</h5>
    </RouterLink>
</template>