<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import type { Facility } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const route = useRoute()
const facility = ref<Facility | null>(null)
const loading = ref(true)
const newStatus = ref('')
const statusLoading = ref(false)

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Closed', label: 'Closed' },
]

onMounted(async () => {
  try {
    const { data } = await api.get(`/community/facilities/${route.params.id}`)
    facility.value = data.data
    newStatus.value = data.data.status
  } finally {
    loading.value = false
  }
})

async function updateStatus() {
  if (!facility.value) return
  statusLoading.value = true
  try {
    await api.patch(`/community/facilities/${facility.value.id}/status`, { status: newStatus.value })
    facility.value.status = newStatus.value as Facility['status']
  } finally {
    statusLoading.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>
    <template v-else-if="facility">
      <div class="flex items-start justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-xl font-bold text-slate-900">{{ facility.name }}</h1>
            <StatusBadge :status="facility.status" />
          </div>
          <p class="text-sm text-slate-400">{{ facility.category }} · Capacity {{ facility.capacity }}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2 space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Booking Configuration</p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><p class="text-slate-400">Slot Duration</p><p class="font-medium">{{ facility.bookingConfig.slotDurationMinutes }} minutes</p></div>
              <div><p class="text-slate-400">Advance Booking</p><p class="font-medium">{{ facility.bookingConfig.advanceBookingDays }} days</p></div>
              <div><p class="text-slate-400">Cancellation Cutoff</p><p class="font-medium">{{ facility.bookingConfig.cancellationCutoffHours }} hours</p></div>
              <div><p class="text-slate-400">Max Slots / Booking</p><p class="font-medium">{{ facility.bookingConfig.maxSlotsPerBooking }}</p></div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Pricing</p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><p class="text-slate-400">Type</p><p class="font-medium">{{ facility.pricing.isPaid ? 'Paid' : 'Free' }}</p></div>
              <div v-if="facility.pricing.isPaid"><p class="text-slate-400">Charge / Slot</p><p class="font-medium">₹{{ facility.pricing.chargePerSlot }}</p></div>
              <div><p class="text-slate-400">Waitlist</p><p class="font-medium">{{ facility.waitlistConfig.enabled ? 'Enabled' : 'Disabled' }}</p></div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Update Status</p>
          <div class="space-y-3">
            <BaseSelect v-model="newStatus" :options="statusOptions" />
            <BaseButton :loading="statusLoading" class="w-full" @click="updateStatus">Save Status</BaseButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
