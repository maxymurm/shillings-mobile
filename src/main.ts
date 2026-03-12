import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

/* Ionic core CSS */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/padding.css';

/* Theme */
import './theme/variables.css';

import { setupDarkMode } from './services/darkmode';
import { configureStatusBar } from './services/statusbar';
import { setupAutoSync } from './offline/sync';

setupDarkMode();

const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
  configureStatusBar();
  setupAutoSync();
});
