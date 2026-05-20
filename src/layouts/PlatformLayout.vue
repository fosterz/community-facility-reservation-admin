<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/ui/AppIcon.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(window.innerWidth >= 768)

watch(() => route.path, () => { if (window.innerWidth < 768) sidebarOpen.value = false })

const navItems = [
  { label: 'Dashboard', path: '/platform/dashboard', icon: 'chart-bar' },
  { label: 'Tenants', path: '/platform/tenants', icon: 'building-library' },
  { label: 'Subscriptions', path: '/platform/subscriptions', icon: 'credit-card' },
  { label: 'Plans', path: '/platform/plans', icon: 'rectangle-stack' },
  { label: 'Join Requests', path: '/platform/join-requests', icon: 'inbox' },
]

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <!-- Backdrop (mobile) -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/40 z-40 md:hidden" @click="sidebarOpen = false" />

    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-slate-900 transition-all duration-300 z-50',
        'fixed md:relative inset-y-0 left-0',
        sidebarOpen ? 'w-60 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16',
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-4 border-b border-slate-700/50 flex-shrink-0">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          CFR
        </div>
        <span v-if="sidebarOpen" class="text-white font-semibold text-sm truncate">Platform Admin</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
            $route.path.startsWith(item.path)
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
          ]"
        >
          <AppIcon :name="item.icon" class="flex-shrink-0" />
          <span v-if="sidebarOpen">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="p-3 border-t border-slate-700/50 flex-shrink-0">
        <div class="flex items-center gap-3 px-2 py-2">
          <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ auth.user?.name?.charAt(0) }}
          </div>
          <div v-if="sidebarOpen" class="min-w-0 flex-1">
            <p class="text-sm text-white font-medium truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-slate-400 truncate">Platform Admin</p>
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
      <!-- Topbar -->
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

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
