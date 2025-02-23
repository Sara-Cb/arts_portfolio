import 'sass-reset'
import './style/main.scss'
import FontAwesomeIcon from './assets/icons.js'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)

app.use(createPinia())

app.mount('#app')