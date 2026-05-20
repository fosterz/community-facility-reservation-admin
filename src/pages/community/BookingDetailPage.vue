<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import type { Booking } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const route = useRoute()
const booking = ref<Booking | null>(null)
const loading = ref(true)
const amountPaid = ref('')
const paymentNotes = ref('')
const paymentLoading = ref(false)
const cancelLoading = ref(false)
const noShowLoading = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get(`/community/bookings/${route.params.id}`)
    booking.value = data.data
    if (booking.value) amountPaid.value = String(booking.value.amountDue)
  } finally {
    loading.value = false
  }
})

async function markPaymentReceived() {
  if (!booking.value) return
  paymentLoading.value = true
  try {
    await api.post(`/community/bookings/${booking.value.id}/mark-paid`, {
      amountPaid: parseFloat(amountPaid.value),
      notes: paymentNotes.value || undefined,
    })
    booking.value.paymentStatus = 'Paid'
  } finally {
    paymentLoading.value = false
  }
}

async function cancelBooking() {
  if (!booking.value || !confirm('Cancel this booking?')) return
  cancelLoading.value = true
  try {
    await api.post(`/community/bookings/${booking.value.id}/cancel`, { reason: 'Cancelled by admin' })
    booking.value.status = 'Cancelled'
  } finally {
    cancelLoading.value = false
  }
}

async function markNoShow() {
  if (!booking.value) return
  noShowLoading.value = true
  try {
    await api.patch(`/community/bookings/${booking.value.id}/no-show`)
    booking.value.status = 'NoShow'
  } finally {
    noShowLoading.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>
    <template v-else-if="booking">
      <div class="flex items-start justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-xl font-bold text-slate-900 font-mono">{{ booking.bookingRef }}</h1>
            <StatusBadge :status="booking.status" />
            <StatusBadge :status="booking.paymentStatus" />
          </div>
          <p class="text-sm text-slate-500">{{ formatDate(booking.date) }}</p>
        </div>
        <div class="flex gap-2">
          <BaseButton
            v-if="booking.status === 'Confirmed'"
            variant="secondary"
            size="sm"
            :loading="noShowLoading"
            @click="markNoShow"
          >
            Mark No-Show
          </BaseButton>
          <BaseButton
            v-if="['Confirmed', 'Waitlisted'].includes(booking.status)"
            variant="danger"
            size="sm"
            :loading="cancelLoading"
            @click="cancelBooking"
          >
            Cancel Booking
          </BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2 space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Booking Details</p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><p class="text-slate-400">Member</p><p class="font-medium">{{ booking.memberName }} (Unit {{ booking.memberUnit }})</p></div>
              <div><p class="text-slate-400">Facility</p><p class="font-medium">{{ booking.facilityName }}</p></div>
              <div>
                <p class="text-slate-400">Slots</p>
                <div class="space-y-1">
                  <p v-for="slot in booking.slots" :key="slot.startTime" class="font-medium">
                    {{ slot.startTime }} – {{ slot.endTime }}
                  </p>
                </div>
              </div>
              <div><p class="text-slate-400">Amount Due</p><p class="font-medium">{{ booking.amountDue > 0 ? `₹${booking.amountDue}` : 'Free' }}</p></div>
            </div>
          </div>
        </div>

        <!-- Payment panel -->
        <div v-if="booking.paymentStatus === 'Pending' && booking.status !== 'Cancelled'" class="bg-white rounded-xl border border-slate-200 p-6">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Mark Payment Received</p>
          <div class="space-y-3">
            <BaseInput v-model="amountPaid" label="Amount Paid (₹)" type="number" />
            <BaseInput v-model="paymentNotes" label="Notes (optional)" placeholder="Cash received at desk" />
            <BaseButton :loading="paymentLoading" class="w-full" @click="markPaymentReceived">
              Confirm Payment
            </BaseButton>
          </div>
        </div>
        <div v-else-if="booking.paymentStatus === 'Paid'" class="bg-emerald-50 rounded-xl border border-emerald-200 p-6 flex flex-col items-center justify-center gap-2">
          <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p class="text-emerald-700 font-semibold">Payment Received</p>
          <p class="text-emerald-600 text-sm">₹{{ booking.amountPaid }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
