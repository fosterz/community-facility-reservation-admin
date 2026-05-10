<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import type { Tenant, Plan } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const route = useRoute()
const tenant = ref<Tenant | null>(null)
const loading = ref(true)
const statusLoading = ref(false)
const newStatus = ref('')

const subscription = ref<Subscription | null>(null)
const plans = ref<Plan[]>([])
const showAssignModal = ref(false)
const assigning = ref(false)
const assignError = ref('')
const assignForm = ref({
  planId: '',
  billingCycle: 'monthly',
  startsAt: '',
  endsAt: '',
  notes: '',
})

interface Subscription {
  id: string
  planId: string
  status: string
  billingCycle: string
  amount: number
  startsAt?: string
  endsAt?: string
  notes?: string
}

const statusOptions = [
  { value: 'Trial', label: 'Trial' },
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const billingOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

const subStatusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'PastDue', label: 'Past Due' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Expired', label: 'Expired' },
]

onMounted(async () => {
  try {
    const [tenantRes, subRes, plansRes] = await Promise.all([
      api.get(`/platform/tenants/${route.params.id}`),
      api.get('/platform/subscriptions', { params: { tenantId: route.params.id } }),
      api.get('/platform/plans'),
    ])
    tenant.value = tenantRes.data.data
    newStatus.value = tenantRes.data.data.status
    subscription.value = subRes.data.data?.[0] ?? null
    plans.value = plansRes.data.data
  } finally {
    loading.value = false
  }
})

async function updateStatus() {
  if (!tenant.value || newStatus.value === tenant.value.status) return
  statusLoading.value = true
  try {
    await api.patch(`/platform/tenants/${tenant.value.id}/status`, { status: newStatus.value })
    tenant.value.status = newStatus.value as Tenant['status']
  } finally {
    statusLoading.value = false
  }
}

function openAssign() {
  assignForm.value = { planId: plans.value[0]?.id ?? '', billingCycle: 'monthly', startsAt: '', endsAt: '', notes: '' }
  assignError.value = ''
  showAssignModal.value = true
}

async function assignPlan() {
  if (!tenant.value || !assignForm.value.planId) return
  assigning.value = true
  assignError.value = ''
  try {
    const { data } = await api.post('/platform/subscriptions', {
      tenantId: tenant.value.id,
      planId: assignForm.value.planId,
      billingCycle: assignForm.value.billingCycle,
      startsAt: assignForm.value.startsAt || null,
      endsAt: assignForm.value.endsAt || null,
      notes: assignForm.value.notes || null,
    })
    subscription.value = data.data
    tenant.value.status = 'Active'
    showAssignModal.value = false
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    assignError.value = e.response?.data?.message ?? 'Failed to assign plan.'
  } finally {
    assigning.value = false
  }
}

async function updateSubStatus(newSubStatus: string) {
  if (!subscription.value) return
  await api.patch(`/platform/subscriptions/${subscription.value.id}/status`, { status: newSubStatus })
  subscription.value.status = newSubStatus
}

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function planName(planId: string) {
  return plans.value.find(p => p.id === planId)?.name ?? planId
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>
    <template v-else-if="tenant">
      <div class="flex items-start justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-xl font-bold text-slate-900">{{ tenant.name }}</h1>
            <StatusBadge :status="tenant.status" />
          </div>
          <p class="text-sm text-slate-500 font-mono">{{ tenant.slug }}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <!-- Info -->
        <div class="col-span-2 space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address</p>
              <p class="text-sm text-slate-700">
                {{ tenant.address?.street }}, {{ tenant.address?.city }}, {{ tenant.address?.state }} – {{ tenant.address?.pincode }}
              </p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Person</p>
              <p class="text-sm text-slate-700 font-medium">{{ tenant.contactPerson?.name }}</p>
              <p class="text-sm text-slate-500">{{ tenant.contactPerson?.email }}</p>
              <p class="text-sm text-slate-500">{{ tenant.contactPerson?.mobile }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Created</p>
              <p class="text-sm text-slate-700">{{ formatDate(tenant.createdAt) }}</p>
            </div>
          </div>

          <!-- Subscription -->
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription</p>
              <BaseButton size="sm" @click="openAssign">
                {{ subscription ? 'Reassign Plan' : 'Assign Plan' }}
              </BaseButton>
            </div>

            <div v-if="subscription" class="space-y-3">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-slate-400">Plan</p>
                  <p class="font-medium text-slate-900">{{ planName(subscription.planId) }}</p>
                </div>
                <div>
                  <p class="text-slate-400">Status</p>
                  <StatusBadge :status="subscription.status" />
                </div>
                <div>
                  <p class="text-slate-400">Billing</p>
                  <p class="font-medium text-slate-900 capitalize">{{ subscription.billingCycle }}</p>
                </div>
                <div>
                  <p class="text-slate-400">Amount</p>
                  <p class="font-medium text-slate-900">₹{{ subscription.amount.toLocaleString('en-IN') }}</p>
                </div>
                <div>
                  <p class="text-slate-400">Starts</p>
                  <p class="font-medium text-slate-900">{{ formatDate(subscription.startsAt) }}</p>
                </div>
                <div>
                  <p class="text-slate-400">Ends</p>
                  <p class="font-medium text-slate-900">{{ formatDate(subscription.endsAt) }}</p>
                </div>
              </div>
              <div v-if="subscription.notes" class="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                {{ subscription.notes }}
              </div>
              <div class="pt-2 border-t border-slate-100">
                <p class="text-xs text-slate-400 mb-2">Update subscription status</p>
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="opt in subStatusOptions"
                    :key="opt.value"
                    :class="[
                      'text-xs px-3 py-1 rounded-full border transition-colors',
                      subscription.status === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                    ]"
                    @click="updateSubStatus(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-slate-400 py-4 text-center">
              No subscription assigned. Click "Assign Plan" to get started.
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Update Tenant Status</p>
            <BaseSelect v-model="newStatus" :options="statusOptions" />
            <BaseButton :loading="statusLoading" class="w-full" @click="updateStatus">
              Save Status
            </BaseButton>
          </div>
        </div>
      </div>
    </template>

    <!-- Assign Plan Modal -->
    <BaseModal :open="showAssignModal" title="Assign Subscription Plan" @close="showAssignModal = false">
      <form class="space-y-4" @submit.prevent="assignPlan">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Plan *</label>
          <select
            v-model="assignForm.planId"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          >
            <option v-for="p in plans" :key="p.id" :value="p.id">
              {{ p.name }} — ₹{{ p.priceMonthly.toLocaleString('en-IN') }}/mo · ₹{{ p.priceAnnual.toLocaleString('en-IN') }}/yr
            </option>
          </select>
        </div>
        <BaseSelect v-model="assignForm.billingCycle" label="Billing Cycle" :options="billingOptions" />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="assignForm.startsAt" label="Start Date" type="date" />
          <BaseInput v-model="assignForm.endsAt" label="End Date" type="date" />
        </div>
        <BaseInput v-model="assignForm.notes" label="Notes (optional)" placeholder="e.g. Promotional pricing" />
        <div v-if="assignError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {{ assignError }}
        </div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showAssignModal = false">Cancel</BaseButton>
        <BaseButton :loading="assigning" @click="assignPlan">Assign Plan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
