import { createApp } from 'vue'
import './styles/global.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/music-player.css'
import './styles/cd-circle-fix.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'


createApp(App).use(router).use(createPinia()).mount('#app')


