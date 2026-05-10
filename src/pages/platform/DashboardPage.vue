<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import StatCard from '@/components/ui/StatCard.vue'

const stats = ref({ tenants: 0, activeSubscriptions: 0, trialTenants: 0, pendingRequests: 0 })
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/platform/dashboard')
    stats.value = data.data
  } catch {
    // use defaults
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 mb-6">Platform Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard label="Total Tenants" :value="stats.tenants" icon="🏘️" color="indigo" />
      <StatCard label="Active Subscriptions" :value="stats.activeSubscriptions" icon="✅" color="emerald" />
      <StatCard label="On Trial" :value="stats.trialTenants" icon="⏳" color="amber" />
      <StatCard label="Pending Join Requests" :value="stats.pendingRequests" icon="📬" color="sky" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <p class="text-slate-400 text-sm text-center py-8">
        More analytics coming soon.
      </p>
    </div>
  </div>
</template>
