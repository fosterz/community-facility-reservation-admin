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
  trialDays: 30,
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
    trialDays: plan.trialDays,
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
          <div class="flex items-center gap-2">
            <span class="text-slate-400">👥</span> Up to {{ plan.maxMembers.toLocaleString() }} members
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">🏢</span> {{ plan.maxFacilities }} facilities
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">📅</span> {{ plan.maxBookingsPerMonth.toLocaleString() }} bookings/mo
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">⏳</span> {{ plan.trialDays }}-day trial
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
          <BaseInput v-model.number="form.trialDays" label="Trial Days" type="number" />
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
