<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { Plan } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const plans = ref<Plan[]>([])
const loading = ref(false)
const showModal = ref(false)
const saving = ref(false)
const editingPlan = ref<Plan | null>(null)
const error = ref('')

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

const blankForm = () => ({
  name: '',
  description: '',
  priceMonthly: 0,
  priceAnnual: 0,
  maxMembers: 100,
  maxFacilities: 5,
  maxBookingsPerMonth: 500,
  isActive: true,
  featureFlags: {
    waitlist: true,
    guestBooking: false,
    paidFacilities: true,
    announcements: true,
    bulkMemberImport: false,
    advancedReports: false,
    staffRoles: false,
    communityDiscovery: true,
  },
})

const form = ref(blankForm())

async function fetchPlans() {
  loading.value = true
  try {
    const { data } = await api.get('/platform/plans')
    plans.value = data.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingPlan.value = null
  form.value = blankForm()
  error.value = ''
  showModal.value = true
}

function openEdit(plan: Plan) {
  editingPlan.value = plan
  form.value = {
    name: plan.name,
    description: plan.description ?? '',
    priceMonthly: plan.priceMonthly,
    priceAnnual: plan.priceAnnual,
    maxMembers: plan.maxMembers,
    maxFacilities: plan.maxFacilities,
    maxBookingsPerMonth: plan.maxBookingsPerMonth,
    isActive: plan.isActive,
    featureFlags: { ...plan.featureFlags },
  }
  error.value = ''
  showModal.value = true
}

async function save() {
  error.value = ''
  saving.value = true
  try {
    if (editingPlan.value) {
      await api.put(`/platform/plans/${editingPlan.value.id}`, {
        ...editingPlan.value,
        ...form.value,
      })
    } else {
      await api.post('/platform/plans', form.value)
    }
    showModal.value = false
    fetchPlans()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to save plan.'
  } finally {
    saving.value = false
  }
}

async function deletePlan(plan: Plan) {
  if (!confirm(`Deactivate plan "${plan.name}"?`)) return
  await api.delete(`/platform/plans/${plan.id}`)
  fetchPlans()
}

onMounted(fetchPlans)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Subscription Plans</h1>
      <BaseButton @click="openCreate">+ New Plan</BaseButton>
    </div>

    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-slate-900">{{ plan.name }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ plan.description }}</p>
          </div>
          <StatusBadge :status="plan.isActive ? 'active' : 'suspended'" />
        </div>

        <div class="mb-4">
          <p class="text-2xl font-bold text-slate-900">
            ₹{{ plan.priceMonthly.toLocaleString('en-IN') }}<span class="text-sm font-normal text-slate-400">/mo</span>
          </p>
          <p class="text-sm text-slate-500">₹{{ plan.priceAnnual.toLocaleString('en-IN') }}/yr</p>
        </div>

        <div class="text-sm text-slate-600 space-y-1 mb-4">
          <div class="flex items-center gap-2 text-slate-600">
            <svg class="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            Up to {{ plan.maxMembers.toLocaleString() }} members
          </div>
          <div class="flex items-center gap-2 text-slate-600">
            <svg class="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
            {{ plan.maxFacilities }} facilities
          </div>
          <div class="flex items-center gap-2 text-slate-600">
            <svg class="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            {{ plan.maxBookingsPerMonth.toLocaleString() }} bookings/mo
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 mb-4">
          <span
            v-for="(enabled, key) in plan.featureFlags"
            :key="key"
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              enabled ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400 line-through'
            ]"
          >
            {{ featureLabels[key] ?? key }}
          </span>
        </div>

        <div class="mt-auto flex gap-2">
          <BaseButton size="sm" variant="secondary" class="flex-1" @click="openEdit(plan)">Edit</BaseButton>
          <BaseButton size="sm" variant="danger" @click="deletePlan(plan)">Deactivate</BaseButton>
        </div>
      </div>
    </div>

    <BaseModal :open="showModal" :title="editingPlan ? 'Edit Plan' : 'New Plan'" @close="showModal = false">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <BaseInput v-model="form.name" label="Plan Name *" placeholder="Starter" />
          </div>
          <div class="col-span-2">
            <BaseInput v-model="form.description" label="Description" placeholder="For small communities" />
          </div>
          <BaseInput v-model.number="form.priceMonthly" label="Monthly Price (₹) *" type="number" />
          <BaseInput v-model.number="form.priceAnnual" label="Annual Price (₹) *" type="number" />
          <BaseInput v-model.number="form.maxMembers" label="Max Members *" type="number" />
          <BaseInput v-model.number="form.maxFacilities" label="Max Facilities *" type="number" />
          <BaseInput v-model.number="form.maxBookingsPerMonth" label="Max Bookings/Month *" type="number" />
        </div>

        <div>
          <p class="text-sm font-medium text-slate-700 mb-2">Feature Flags</p>
          <div class="grid grid-cols-2 gap-2">
            <label v-for="(_, key) in form.featureFlags" :key="key" class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input v-model="form.featureFlags[key]" type="checkbox" class="rounded" />
              {{ featureLabels[key] ?? key }}
            </label>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input v-model="form.isActive" type="checkbox" class="rounded" />
          Plan is active (visible to tenants)
        </label>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{{ error }}</div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
        <BaseButton :loading="saving" @click="save">{{ editingPlan ? 'Save Changes' : 'Create Plan' }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
