<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api } from '@/lib/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [] }>()

const form = reactive({
  name: '',
  category: '',
  description: '',
  capacity: 10,
  slotDurationMinutes: 60,
  advanceBookingDays: 7,
  cancellationCutoffHours: 2,
  maxSlotsPerBooking: 3,
  isPaid: false,
  chargePerSlot: 0,
  waitlistEnabled: false,
})

const loading = ref(false)
const error = ref('')

const categoryOptions = [
  { value: 'Sports', label: 'Sports' },
  { value: 'Recreation', label: 'Recreation' },
  { value: 'Meeting', label: 'Meeting Room' },
  { value: 'Banquet', label: 'Banquet Hall' },
  { value: 'Gym', label: 'Gym' },
  { value: 'Pool', label: 'Swimming Pool' },
  { value: 'Other', label: 'Other' },
]

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await api.post('/community/facilities', {
      name: form.name,
      category: form.category,
      description: form.description,
      capacity: form.capacity,
      bookingConfig: {
        slotDurationMinutes: form.slotDurationMinutes,
        advanceBookingDays: form.advanceBookingDays,
        cancellationCutoffHours: form.cancellationCutoffHours,
        maxSlotsPerBooking: form.maxSlotsPerBooking,
        maxBookingsPerDayPerMember: 2,
        maxBookingsPerWeekPerMember: 0,
        maxBookingsPerMonthPerMember: 0,
      },
      pricing: {
        isPaid: form.isPaid,
        chargePerSlot: form.chargePerSlot,
        peakHourSurcharge: 0,
        refundPolicy: 'No refund after cancellation cutoff.',
      },
      waitlistConfig: { enabled: form.waitlistEnabled, maxPerSlot: 3, autoPromote: true },
    })
    emit('created')
    emit('close')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to create facility.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" title="Add New Facility" size="lg" @close="emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.name" label="Facility Name *" placeholder="Basketball Court A" />
        <BaseSelect v-model="form.category" label="Category *" :options="categoryOptions" placeholder="Select category" />
        <BaseInput v-model.number="form.capacity" label="Capacity" type="number" />
        <BaseInput v-model="form.description" label="Description" placeholder="Optional description" />
      </div>

      <hr class="border-slate-100" />
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Config</p>
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model.number="form.slotDurationMinutes" label="Slot Duration (min)" type="number" />
        <BaseInput v-model.number="form.advanceBookingDays" label="Advance Booking (days)" type="number" />
        <BaseInput v-model.number="form.cancellationCutoffHours" label="Cancellation Cutoff (hrs)" type="number" />
        <BaseInput v-model.number="form.maxSlotsPerBooking" label="Max Slots per Booking" type="number" />
      </div>

      <hr class="border-slate-100" />
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing</p>
      <div class="flex items-center gap-3">
        <input id="isPaid" v-model="form.isPaid" type="checkbox" class="rounded" />
        <label for="isPaid" class="text-sm text-slate-700">Paid facility</label>
      </div>
      <BaseInput v-if="form.isPaid" v-model.number="form.chargePerSlot" label="Charge per Slot (₹)" type="number" />

      <hr class="border-slate-100" />
      <div class="flex items-center gap-3">
        <input id="waitlist" v-model="form.waitlistEnabled" type="checkbox" class="rounded" />
        <label for="waitlist" class="text-sm text-slate-700">Enable waitlist</label>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{{ error }}</div>
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton :loading="loading" @click="submit">Create Facility</BaseButton>
    </template>
  </BaseModal>
</template>
