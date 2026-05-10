<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(true)

const allNavItems = [
  { label: 'Dashboard', path: '/community/dashboard', icon: '📊', roles: ['community_admin', 'staff'] },
  { label: 'Members', path: '/community/members', icon: '👥', roles: ['community_admin', 'staff'] },
  { label: 'Facilities', path: '/community/facilities', icon: '🏢', roles: ['community_admin', 'staff'] },
  { label: 'Bookings', path: '/community/bookings', icon: '📅', roles: ['community_admin', 'staff'] },
  { label: 'Invoices', path: '/community/invoices', icon: '🧾', roles: ['community_admin', 'staff'] },
  { label: 'Announcements', path: '/community/announcements', icon: '📣', roles: ['community_admin'] },
  { label: 'Join Requests', path: '/community/join-requests', icon: '📬', roles: ['community_admin'] },
  { label: 'Staff', path: '/community/staff', icon: '🛡️', roles: ['community_admin'] },
  { label: 'Reports', path: '/community/reports', icon: '📈', roles: ['community_admin'] },
  { label: 'Settings', path: '/community/settings', icon: '⚙️', roles: ['community_admin'] },
]

const navItems = computed(() =>
  allNavItems.filter(item => item.roles.includes(auth.user?.role ?? ''))
)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="['flex flex-col bg-slate-900 transition-all duration-300 flex-shrink-0', sidebarOpen ? 'w-60' : 'w-16']"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-4 border-b border-slate-700/50">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          CFR
        </div>
        <div v-if="sidebarOpen" class="min-w-0">
          <p class="text-white font-semibold text-sm truncate">{{ auth.user?.tenantName ?? 'Community' }}</p>
          <p class="text-slate-400 text-xs truncate capitalize">{{ auth.user?.role?.replace('_', ' ') }}</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
            $route.path.startsWith(item.path)
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          ]"
        >
          <span class="text-base flex-shrink-0">{{ item.icon }}</span>
          <span v-if="sidebarOpen">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="p-3 border-t border-slate-700/50">
        <div class="flex items-center gap-3 px-2 py-2">
          <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ auth.user?.name?.charAt(0) }}
          </div>
          <div v-if="sidebarOpen" class="min-w-0 flex-1">
            <p class="text-sm text-white font-medium truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-slate-400 truncate">{{ auth.user?.email }}</p>
          </div>
          <button v-if="sidebarOpen" class="text-slate-400 hover:text-white transition-colors" @click="logout">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-6 flex-shrink-0">
        <button
          class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          @click="sidebarOpen = !sidebarOpen"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <div class="flex-1" />
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
