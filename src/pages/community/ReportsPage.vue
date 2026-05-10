<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import StatCard from '@/components/ui/StatCard.vue'

const summary = ref({
  totalBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0,
  noShowBookings: 0,
  totalRevenue: 0,
  pendingRevenue: 0,
  totalMembers: 0,
  activeMembers: 0,
})
const loading = ref(true)
const fromDate = ref('')
const toDate = ref('')

async function fetchReport() {
  loading.value = true
  try {
    const { data } = await api.get('/community/reports/summary', {
      params: { from: fromDate.value || undefined, to: toDate.value || undefined }
    })
    summary.value = data.data
  } catch {
    // defaults
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Reports</h1>
      <div class="flex gap-3 items-center">
        <input v-model="fromDate" type="date" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        <span class="text-slate-400 text-sm">to</span>
        <input v-model="toDate" type="date" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        <button
          class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          @click="fetchReport"
        >
          Apply
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Bookings" :value="summary.totalBookings" icon="📅" color="indigo" />
      <StatCard label="Confirmed" :value="summary.confirmedBookings" icon="✅" color="emerald" />
      <StatCard label="Cancelled" :value="summary.cancelledBookings" icon="❌" color="rose" />
      <StatCard label="No-Shows" :value="summary.noShowBookings" icon="⏰" color="amber" />
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Revenue" :value="`₹${summary.totalRevenue.toLocaleString('en-IN')}`" icon="💰" color="emerald" />
      <StatCard label="Pending Revenue" :value="`₹${summary.pendingRevenue.toLocaleString('en-IN')}`" icon="⏳" color="amber" />
      <StatCard label="Total Members" :value="summary.totalMembers" icon="👥" color="indigo" />
      <StatCard label="Active Members" :value="summary.activeMembers" icon="👤" color="sky" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <p class="text-slate-400 text-sm text-center py-8">Detailed charts and export coming soon.</p>
    </div>
  </div>
</template>
