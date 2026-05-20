<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import type { Facility } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CreateFacilityModal from '@/components/community/CreateFacilityModal.vue'

const router = useRouter()
const facilities = ref<Facility[]>([])
const loading = ref(false)
const showCreate = ref(false)

async function fetchFacilities() {
  loading.value = true
  try {
    const { data } = await api.get('/community/facilities')
    facilities.value = data.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchFacilities)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Facilities</h1>
      <BaseButton @click="showCreate = true">+ Add Facility</BaseButton>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 h-48 animate-pulse" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="facility in facilities"
        :key="facility.id"
        class="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
        @click="router.push(`/community/facilities/${facility.id}`)"
      >
        <div class="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
          <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between mb-1">
            <h3 class="font-semibold text-slate-900">{{ facility.name }}</h3>
            <StatusBadge :status="facility.status" />
          </div>
          <p class="text-xs text-slate-400">{{ facility.category }} · Capacity {{ facility.capacity }}</p>
          <div class="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span v-if="facility.pricing.isPaid" class="text-emerald-600 font-medium">₹{{ facility.pricing.chargePerSlot }}/slot</span>
            <span v-else class="text-slate-400">Free</span>
            <span>·</span>
            <span>{{ facility.bookingConfig.slotDurationMinutes }}min slots</span>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && facilities.length === 0"
        class="col-span-3 text-center py-16 text-slate-400"
      >
        No facilities yet. Add your first facility to get started.
      </div>
    </div>

    <CreateFacilityModal :open="showCreate" @close="showCreate = false" @created="fetchFacilities" />
  </div>
</template>
