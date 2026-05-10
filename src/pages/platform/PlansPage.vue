<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { Plan } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const plans = ref<Plan[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/platform/plans')
    plans.value = data.data
  } finally {
    loading.value = false
  }
})

const featureLabels: Record<string, string> = {
  waitlist: 'Waitlist',
  guestBooking: 'Guest Booking',
  paidFacilities: 'Paid Facilities',
  announcements: 'Announcements',
  bulkMemberImport: 'Bulk Import',
  advancedReports: 'Advanced Reports',
  staffRoles: 'Staff Roles',
  communityDiscovery: 'Discovery',
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Subscription Plans</h1>
      <BaseButton>+ New Plan</BaseButton>
    </div>

    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-slate-900">{{ plan.name }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ plan.description }}</p>
          </div>
          <StatusBadge :status="plan.isActive ? 'active' : 'suspended'" />
        </div>

        <div class="mb-4">
          <p class="text-2xl font-bold text-slate-900">₹{{ plan.monthlyPrice.toLocaleString('en-IN') }}<span class="text-sm font-normal text-slate-400">/mo</span></p>
          <p class="text-sm text-slate-500">₹{{ plan.annualPrice.toLocaleString('en-IN') }}/yr</p>
        </div>

        <div class="text-sm text-slate-600 space-y-1 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-slate-400">👥</span> Up to {{ plan.maxMembers.toLocaleString() }} members
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">🏢</span> {{ plan.maxFacilities }} facilities
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">🛡️</span> {{ plan.maxAdmins }} admins
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(enabled, key) in plan.features"
            :key="key"
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              enabled ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400 line-through'
            ]"
          >
            {{ featureLabels[key] ?? key }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
