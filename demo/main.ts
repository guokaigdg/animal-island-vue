import { createApp } from 'vue';
import App from './App.vue';
import '../src/index.ts';

document.body.style.margin = '0';

const globalStyle = document.createElement('style');
globalStyle.textContent = `*::-webkit-scrollbar { display: none; }`;
document.head.appendChild(globalStyle);

createApp(App).mount('#app');
