// import './assets/main.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { abilitiesPlugin, Can } from '@casl/vue'

import App from './App.vue'
import router from './router'
import { ability } from './services/ability'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives
});

const app = createApp(App)
app.use(vuetify)
app.use(createPinia())
app.use(abilitiesPlugin, ability, { useGlobalProperties: true })
app.component('Can', Can)
app.use(router)

app.mount('#app')
