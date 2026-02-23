import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setupKeyboard } from './plugins/capacitor'
import './assets/main.css'

setupKeyboard()

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
