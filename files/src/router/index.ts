import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';

// Hash history: the window has no address bar, and a reload keeps the current page in both the
// dev server and the bundled app.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/notes', name: 'notes', component: () => import('@/pages/NotesPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
});
