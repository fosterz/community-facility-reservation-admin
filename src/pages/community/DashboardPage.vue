<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import StatCard from '@/components/ui/StatCard.vue'

const stats = ref({
  totalMembers: 0,
  activeBookings: 0,
  pendingPayments: 0,
  facilities: 0,
  todayBookings: 0,
  pendingJoinRequests: 0,
})
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/community/dashboard')
    stats.value = data.data
  } catch {
    // defaults
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 mb-6">Dashboard</h1>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <StatCard label="Total Members" :value="stats.totalMembers" icon="👥" color="indigo" />
      <StatCard label="Active Bookings" :value="stats.activeBookings" icon="📅" color="emerald" />
      <StatCard label="Pending Payments" :value="stats.pendingPayments" icon="💳" color="amber" />
      <StatCard label="Facilities" :value="stats.facilities" icon="🏢" color="sky" />
      <StatCard label="Today's Bookings" :value="stats.todayBookings" icon="📆" color="indigo" />
      <StatCard label="Join Requests" :value="stats.pendingJoinRequests" icon="📬" color="rose" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <p class="text-slate-400 text-sm text-center py-8">Recent activity feed coming soon.</p>
    </div>
  </div>
</template>
