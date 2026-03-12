import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/tabs/dashboard' },
  {
    path: '/login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/tabs',
    component: () => import('@/views/TabsLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/tabs/dashboard' },
      { path: 'dashboard', component: () => import('@/views/home/DashboardPage.vue') },
      { path: 'accounts', component: () => import('@/views/accounts/AccountListPage.vue') },
      { path: 'accounts/create', component: () => import('@/views/accounts/AccountCreatePage.vue') },
      { path: 'accounts/:id', component: () => import('@/views/accounts/AccountDetailPage.vue') },
      { path: 'transactions', component: () => import('@/views/transactions/TransactionListPage.vue') },
      { path: 'transactions/create', component: () => import('@/views/transactions/TransactionCreatePage.vue') },
      { path: 'transactions/:id', component: () => import('@/views/transactions/TransactionDetailPage.vue') },
      { path: 'transactions/:id/edit', component: () => import('@/views/transactions/TransactionEditPage.vue') },
      { path: 'contacts', component: () => import('@/views/contacts/ContactListPage.vue') },
      { path: 'reports', component: () => import('@/views/reports/ReportsPage.vue') },
      { path: 'settings', component: () => import('@/views/settings/SettingsPage.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/auth');
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) return '/login';
  if (to.meta.requiresGuest && authStore.isAuthenticated) return '/tabs/dashboard';
});

export default router;
