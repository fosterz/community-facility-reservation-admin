import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const LoginPage = () => import('@/pages/LoginPage.vue')
const MfaPage = () => import('@/pages/MfaPage.vue')

const PlatformLayout = () => import('@/layouts/PlatformLayout.vue')
const PlatformDashboard = () => import('@/pages/platform/DashboardPage.vue')
const PlatformTenants = () => import('@/pages/platform/TenantsPage.vue')
const PlatformTenantDetail = () => import('@/pages/platform/TenantDetailPage.vue')
const PlatformPlans = () => import('@/pages/platform/PlansPage.vue')
const PlatformJoinRequests = () => import('@/pages/platform/JoinRequestsPage.vue')
const PlatformSubscriptions = () => import('@/pages/platform/SubscriptionsPage.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage, meta: { public: true } },
    { path: '/mfa', component: MfaPage, meta: { public: true } },

    {
      path: '/platform',
      component: PlatformLayout,
      meta: { requiresAuth: true, role: 'platform_admin' },
      children: [
        { path: '', redirect: '/platform/dashboard' },
        { path: 'dashboard', component: PlatformDashboard },
        { path: 'tenants', component: PlatformTenants },
        { path: 'tenants/:id', component: PlatformTenantDetail },
        { path: 'plans', component: PlatformPlans },
        { path: 'join-requests', component: PlatformJoinRequests },
        { path: 'subscriptions', component: PlatformSubscriptions }
      ]
    },

    { path: '/', redirect: '/login' },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!to.meta.public) {
    const hasToken = auth.restoreFromStorage()
    if (!hasToken) return '/login'

    if (!auth.user) {
      await auth.fetchProfile().catch(() => {})
      if (!auth.user) return '/login'
    }

    if (!auth.isPlatformAdmin) return '/login'
  }
})
