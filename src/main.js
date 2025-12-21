import "sass-reset";
import "./style/main.scss";
import FontAwesomeIcon from "./assets/icons/icons.js";
import fitToViewport from "@/directives/fitToViewport";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);

app.use(createPinia());

app.directive("fit-to-viewport", fitToViewport);

app.mount("#app");
