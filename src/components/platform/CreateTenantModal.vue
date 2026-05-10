<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api } from '@/lib/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [] }>()

const form = reactive({
  name: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  lat: '',
  lng: '',
  contactName: '',
  contactEmail: '',
  contactMobile: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  planId: '',
  trialDays: 30,
})
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await api.post('/platform/tenants', {
      name: form.name,
      address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode, country: form.country },
      location: form.lat && form.lng ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) } : undefined,
      contactPerson: { name: form.contactName, email: form.contactEmail, mobile: form.contactMobile },
      adminName: form.adminName,
      adminEmail: form.adminEmail,
      adminPassword: form.adminPassword,
      planId: form.planId || undefined,
      trialDays: form.trialDays,
    })
    emit('created')
    emit('close')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to create tenant.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" title="Create New Community" size="lg" @close="emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <BaseInput v-model="form.name" label="Community Name *" placeholder="e.g. Green Valley Apartments" />
        </div>
        <BaseInput v-model="form.street" label="Street Address" />
        <BaseInput v-model="form.city" label="City *" />
        <BaseInput v-model="form.state" label="State *" />
        <BaseInput v-model="form.pincode" label="Pincode" />
        <BaseInput v-model="form.lat" label="Latitude (optional)" placeholder="12.9716" />
        <BaseInput v-model="form.lng" label="Longitude (optional)" placeholder="77.5946" />
      </div>

      <hr class="border-slate-100" />
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Person</p>
      <div class="grid grid-cols-3 gap-4">
        <BaseInput v-model="form.contactName" label="Name" />
        <BaseInput v-model="form.contactEmail" label="Email" type="email" />
        <BaseInput v-model="form.contactMobile" label="Mobile" />
      </div>

      <hr class="border-slate-100" />
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Account</p>
      <div class="grid grid-cols-3 gap-4">
        <BaseInput v-model="form.adminName" label="Admin Name *" />
        <BaseInput v-model="form.adminEmail" label="Admin Email *" type="email" />
        <BaseInput v-model="form.adminPassword" label="Admin Password *" type="password" />
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        {{ error }}
      </div>
    </form>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton :loading="loading" @click="submit">Create Community</BaseButton>
    </template>
  </BaseModal>
</template>
