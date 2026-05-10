import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy-load all pages
const LoginPage = () => import('@/pages/LoginPage.vue')
const MfaPage = () => import('@/pages/MfaPage.vue')

// Platform admin pages
const PlatformLayout = () => import('@/layouts/PlatformLayout.vue')
const PlatformDashboard = () => import('@/pages/platform/DashboardPage.vue')
const PlatformTenants = () => import('@/pages/platform/TenantsPage.vue')
const PlatformTenantDetail = () => import('@/pages/platform/TenantDetailPage.vue')
const PlatformPlans = () => import('@/pages/platform/PlansPage.vue')
const PlatformJoinRequests = () => import('@/pages/platform/JoinRequestsPage.vue')

// Community admin pages
const CommunityLayout = () => import('@/layouts/CommunityLayout.vue')
const CommunityDashboard = () => import('@/pages/community/DashboardPage.vue')
const MembersPage = () => import('@/pages/community/MembersPage.vue')
const MemberDetailPage = () => import('@/pages/community/MemberDetailPage.vue')
const FacilitiesPage = () => import('@/pages/community/FacilitiesPage.vue')
const FacilityDetailPage = () => import('@/pages/community/FacilityDetailPage.vue')
const BookingsPage = () => import('@/pages/community/BookingsPage.vue')
const BookingDetailPage = () => import('@/pages/community/BookingDetailPage.vue')
const InvoicesPage = () => import('@/pages/community/InvoicesPage.vue')
const AnnouncementsPage = () => import('@/pages/community/AnnouncementsPage.vue')
const JoinRequestsPage = () => import('@/pages/community/JoinRequestsPage.vue')
const SettingsPage = () => import('@/pages/community/SettingsPage.vue')
const StaffPage = () => import('@/pages/community/StaffPage.vue')
const ReportsPage = () => import('@/pages/community/ReportsPage.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage, meta: { public: true } },
    { path: '/mfa', component: MfaPage, meta: { public: true } },

    // Platform admin
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
        { path: 'join-requests', component: PlatformJoinRequests }
      ]
    },

    // Community admin / staff
    {
      path: '/community',
      component: CommunityLayout,
      meta: { requiresAuth: true, role: 'community' },
      children: [
        { path: '', redirect: '/community/dashboard' },
        { path: 'dashboard', component: CommunityDashboard },
        { path: 'members', component: MembersPage },
        { path: 'members/:id', component: MemberDetailPage },
        { path: 'facilities', component: FacilitiesPage },
        { path: 'facilities/:id', component: FacilityDetailPage },
        { path: 'bookings', component: BookingsPage },
        { path: 'bookings/:id', component: BookingDetailPage },
        { path: 'invoices', component: InvoicesPage },
        { path: 'announcements', component: AnnouncementsPage },
        { path: 'join-requests', component: JoinRequestsPage },
        { path: 'staff', component: StaffPage },
        { path: 'reports', component: ReportsPage },
        { path: 'settings', component: SettingsPage }
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

    if (to.meta.role === 'platform_admin' && !auth.isPlatformAdmin) {
      return auth.isPlatformAdmin ? '/platform' : '/community'
    }
    if (to.meta.role === 'community' && auth.isPlatformAdmin) {
      return '/platform'
    }
  }
})
