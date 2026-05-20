<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import type { Tenant, Plan, Subscription } from '@/types'
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
const subscriptionHistory = ref<Subscription[]>([])
const stats = ref<{ memberCount: number; bookingCount: number } | null>(null)

// Assign plan modal
const showAssignModal = ref(false)
const assigning = ref(false)
const assignError = ref('')
const assignForm = ref({ planId: '', billingCycle: 'monthly', startsAt: '', endsAt: '', notes: '' })

// Edit tenant modal
const showEditModal = ref(false)
const editSaving = ref(false)
const editError = ref('')
const editForm = ref({
  name: '', type: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  contactPersonName: '', contactPersonEmail: '', contactPersonMobile: '',
})

const typeOptions = [
  { value: 'Apartment', label: 'Apartment Complex' },
  { value: 'Villa', label: 'Villa Complex' },
  { value: 'Gated', label: 'Gated Community' },
  { value: 'Commercial', label: 'Commercial Complex' },
  { value: 'Other', label: 'Other' },
]
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

const planOptions = computed(() =>
  plans.value.filter(p => p.isActive).map(p => ({
    value: p.id,
    label: `${p.name} — ₹${p.priceMonthly.toLocaleString('en-IN')}/mo · ₹${p.priceAnnual.toLocaleString('en-IN')}/yr`,
  }))
)

// Auto-fill dates when billing cycle or plan changes
watch([() => assignForm.value.billingCycle, () => assignForm.value.planId], () => {
  const today = new Date()
  const start = today.toISOString().slice(0, 10)
  let end: string
  if (assignForm.value.billingCycle === 'annual') {
    const d = new Date(today)
    d.setFullYear(d.getFullYear() + 1)
    end = d.toISOString().slice(0, 10)
  } else {
    const d = new Date(today)
    d.setMonth(d.getMonth() + 1)
    end = d.toISOString().slice(0, 10)
  }
  assignForm.value.startsAt = start
  assignForm.value.endsAt = end
})

onMounted(async () => {
  try {
    const id = route.params.id as string
    const [tenantRes, subRes, plansRes, statsRes] = await Promise.all([
      api.get(`/platform/tenants/${id}`),
      api.get('/platform/subscriptions', { params: { tenantId: id } }),
      api.get('/platform/plans'),
      api.get(`/platform/tenants/${id}/stats`),
    ])
    tenant.value = tenantRes.data.data
    newStatus.value = tenantRes.data.data.status
    stats.value = statsRes.data.data

    const allSubs: Subscription[] = subRes.data.data ?? []
    const currentId = tenantRes.data.data.subscriptionId
    subscription.value = allSubs.find(s => s.id === currentId) ?? allSubs[0] ?? null
    subscriptionHistory.value = allSubs.filter(s => s.id !== subscription.value?.id)

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
  assignForm.value = { planId: planOptions.value[0]?.value ?? '', billingCycle: 'monthly', startsAt: '', endsAt: '', notes: '' }
  assignError.value = ''
  showAssignModal.value = true
  // Trigger auto-fill
  const today = new Date()
  const d = new Date(today)
  d.setMonth(d.getMonth() + 1)
  assignForm.value.startsAt = today.toISOString().slice(0, 10)
  assignForm.value.endsAt = d.toISOString().slice(0, 10)
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
    if (subscription.value) {
      subscriptionHistory.value = [
        { ...subscription.value, status: 'Cancelled' as Subscription['status'] },
        ...subscriptionHistory.value,
      ]
    }
    subscription.value = data.data
    tenant.value.status = 'Active'
    newStatus.value = 'Active'
    showAssignModal.value = false
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    assignError.value = e.response?.data?.message ?? 'Failed to assign plan.'
  } finally {
    assigning.value = false
  }
}

async function updateSubStatus(s: string) {
  if (!subscription.value) return
  await api.patch(`/platform/subscriptions/${subscription.value.id}/status`, { status: s })
  subscription.value.status = s as Subscription['status']
}

function openEdit() {
  if (!tenant.value) return
  editForm.value = {
    name: tenant.value.name,
    type: tenant.value.type ?? 'Apartment',
    addressLine1: tenant.value.address?.line1 ?? '',
    addressLine2: tenant.value.address?.line2 ?? '',
    city: tenant.value.address?.city ?? '',
    state: tenant.value.address?.state ?? '',
    pincode: tenant.value.address?.pincode ?? '',
    contactPersonName: tenant.value.contactPerson?.name ?? '',
    contactPersonEmail: tenant.value.contactPerson?.email ?? '',
    contactPersonMobile: tenant.value.contactPerson?.mobile ?? '',
  }
  editError.value = ''
  showEditModal.value = true
}

async function saveEdit() {
  if (!tenant.value) return
  editSaving.value = true
  editError.value = ''
  try {
    const { data } = await api.put(`/platform/tenants/${tenant.value.id}`, editForm.value)
    tenant.value = data.data
    showEditModal.value = false
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    editError.value = e.response?.data?.message ?? 'Failed to save changes.'
  } finally {
    editSaving.value = false
  }
}

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Trial editing
const editingTrial = ref(false)
const trialDate = ref('')
const savingTrial = ref(false)

function openEditTrial() {
  trialDate.value = tenant.value?.trialEndsAt
    ? new Date(tenant.value.trialEndsAt).toISOString().slice(0, 10)
    : ''
  editingTrial.value = true
}

async function saveTrial() {
  if (!tenant.value) return
  savingTrial.value = true
  try {
    await api.patch(`/platform/tenants/${tenant.value.id}/trial`, {
      trialEndsAt: trialDate.value ? new Date(trialDate.value).toISOString() : null,
    })
    tenant.value.trialEndsAt = trialDate.value ? new Date(trialDate.value).toISOString() : undefined
    editingTrial.value = false
  } finally {
    savingTrial.value = false
  }
}

function trialDaysLeft(endsAt?: string) {
  if (!endsAt) return null
  const diff = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000)
  return diff
}

function planName(planId: string) {
  return plans.value.find(p => p.id === planId)?.name ?? planId
}

function selectedPlanPrice() {
  const plan = plans.value.find(p => p.id === assignForm.value.planId)
  if (!plan) return null
  return assignForm.value.billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>
    <template v-else-if="tenant">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-xl font-bold text-slate-900">{{ tenant.name }}</h1>
            <StatusBadge :status="tenant.status" />
          </div>
          <p class="text-sm text-slate-500 font-mono">{{ tenant.slug }} · {{ tenant.type }}</p>
        </div>
        <BaseButton size="sm" variant="secondary" @click="openEdit">Edit Details</BaseButton>
      </div>

      <!-- Stats strip -->
      <div v-if="stats" class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg></div>
          <div>
            <p class="text-2xl font-bold text-slate-900">{{ stats.memberCount.toLocaleString('en-IN') }}</p>
            <p class="text-xs text-slate-400">Total Members</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg></div>
          <div>
            <p class="text-2xl font-bold text-slate-900">{{ stats.bookingCount.toLocaleString('en-IN') }}</p>
            <p class="text-xs text-slate-400">Total Bookings</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <!-- Info + Subscription -->
        <div class="col-span-2 space-y-4">
          <!-- Info card -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Address</p>
              <p class="text-sm text-slate-700">
                {{ tenant.address?.line1 }}
                <span v-if="tenant.address?.line2">, {{ tenant.address.line2 }}</span>,
                {{ tenant.address?.city }}, {{ tenant.address?.state }} – {{ tenant.address?.pincode }}
              </p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Person</p>
              <p class="text-sm text-slate-700 font-medium">{{ tenant.contactPerson?.name }}</p>
              <p class="text-sm text-slate-500">{{ tenant.contactPerson?.email }}</p>
              <p class="text-sm text-slate-500">{{ tenant.contactPerson?.mobile }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Created</p>
                <p class="text-sm text-slate-700">{{ formatDate(tenant.createdAt) }}</p>
              </div>
              <div v-if="tenant.status === 'Trial'">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trial Ends</p>
                  <button class="text-xs text-indigo-600 hover:text-indigo-800 font-medium" @click="openEditTrial">
                    Edit
                  </button>
                </div>
                <template v-if="!editingTrial">
                  <p class="text-sm font-medium" :class="(trialDaysLeft(tenant.trialEndsAt) ?? 1) <= 0 ? 'text-red-600' : (trialDaysLeft(tenant.trialEndsAt) ?? 99) <= 7 ? 'text-amber-600' : 'text-slate-700'">
                    {{ tenant.trialEndsAt ? formatDate(tenant.trialEndsAt) : '—' }}
                  </p>
                  <p v-if="tenant.trialEndsAt" class="text-xs mt-0.5" :class="(trialDaysLeft(tenant.trialEndsAt) ?? 1) <= 0 ? 'text-red-500' : 'text-slate-400'">
                    {{ (trialDaysLeft(tenant.trialEndsAt) ?? 0) > 0 ? `${trialDaysLeft(tenant.trialEndsAt)} days left` : 'Expired' }}
                  </p>
                </template>
                <div v-else class="flex items-center gap-2 mt-1">
                  <input
                    v-model="trialDate"
                    type="date"
                    class="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <BaseButton size="sm" :loading="savingTrial" @click="saveTrial">Save</BaseButton>
                  <button class="text-xs text-slate-400 hover:text-slate-600" @click="editingTrial = false">✕</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Subscription card -->
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription</p>
              <BaseButton size="sm" @click="openAssign">
                {{ subscription ? 'Reassign Plan' : 'Assign Plan' }}
              </BaseButton>
            </div>

            <div v-if="subscription" class="space-y-4">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-slate-400 text-xs mb-0.5">Plan</p>
                  <p class="font-medium text-slate-900">{{ planName(subscription.planId) }}</p>
                </div>
                <div>
                  <p class="text-slate-400 text-xs mb-0.5">Status</p>
                  <StatusBadge :status="subscription.status" />
                </div>
                <div>
                  <p class="text-slate-400 text-xs mb-0.5">Billing</p>
                  <p class="font-medium text-slate-900 capitalize">{{ subscription.billingCycle || '—' }}</p>
                </div>
                <div>
                  <p class="text-slate-400 text-xs mb-0.5">Amount</p>
                  <p class="font-medium text-slate-900">
                    {{ subscription.amount > 0 ? `₹${subscription.amount.toLocaleString('en-IN')}` : '—' }}
                  </p>
                </div>
                <div>
                  <p class="text-slate-400 text-xs mb-0.5">Starts</p>
                  <p class="font-medium text-slate-900">{{ formatDate(subscription.startsAt) }}</p>
                </div>
                <div>
                  <p class="text-slate-400 text-xs mb-0.5">Ends</p>
                  <p class="font-medium text-slate-900">{{ formatDate(subscription.endsAt) }}</p>
                </div>
              </div>
              <div v-if="subscription.notes" class="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                {{ subscription.notes }}
              </div>

              <!-- Sub status quick-set -->
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
                  >{{ opt.label }}</button>
                </div>
              </div>
            </div>

            <div v-else class="text-sm text-slate-400 py-6 text-center">
              No subscription assigned yet. Click "Assign Plan" to activate this community.
            </div>
          </div>
        </div>

          <!-- Subscription history -->
          <div v-if="subscriptionHistory.length > 0" class="bg-white rounded-xl border border-slate-200 p-6">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Subscription History</p>
            <div class="space-y-3">
              <div
                v-for="s in subscriptionHistory"
                :key="s.id"
                class="flex items-center justify-between text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p class="font-medium text-slate-700">{{ planName(s.planId) }}</p>
                  <p class="text-xs text-slate-400 capitalize">
                    {{ s.billingCycle }} · {{ formatDate(s.startsAt) }} – {{ formatDate(s.endsAt) }}
                  </p>
                </div>
                <StatusBadge :status="s.status" />
              </div>
            </div>
          </div>

        <!-- Sidebar actions -->
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tenant Status</p>
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
            <option v-for="p in plans.filter(x => x.isActive)" :key="p.id" :value="p.id">
              {{ p.name }} — ₹{{ p.priceMonthly.toLocaleString('en-IN') }}/mo · ₹{{ p.priceAnnual.toLocaleString('en-IN') }}/yr
            </option>
          </select>
        </div>

        <BaseSelect v-model="assignForm.billingCycle" label="Billing Cycle" :options="billingOptions" />

        <div v-if="selectedPlanPrice()" class="bg-indigo-50 text-indigo-700 text-sm rounded-lg px-3 py-2">
          Amount: ₹{{ selectedPlanPrice()?.toLocaleString('en-IN') }} / {{ assignForm.billingCycle === 'annual' ? 'year' : 'month' }}
        </div>

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

    <!-- Edit Tenant Modal -->
    <BaseModal :open="showEditModal" title="Edit Community Details" size="lg" @close="showEditModal = false">
      <form class="space-y-4" @submit.prevent="saveEdit">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <BaseInput v-model="editForm.name" label="Community Name *" />
          </div>
          <BaseSelect v-model="editForm.type" label="Type *" :options="typeOptions" />
          <div class="col-span-2">
            <BaseInput v-model="editForm.addressLine1" label="Street Address *" />
          </div>
          <BaseInput v-model="editForm.city" label="City *" />
          <BaseInput v-model="editForm.state" label="State *" />
          <BaseInput v-model="editForm.pincode" label="Pincode *" />
        </div>
        <hr class="border-slate-100" />
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Person</p>
        <div class="grid grid-cols-3 gap-4">
          <BaseInput v-model="editForm.contactPersonName" label="Name *" />
          <BaseInput v-model="editForm.contactPersonEmail" label="Email *" type="email" />
          <BaseInput v-model="editForm.contactPersonMobile" label="Mobile *" />
        </div>
        <div v-if="editError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {{ editError }}
        </div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showEditModal = false">Cancel</BaseButton>
        <BaseButton :loading="editSaving" @click="saveEdit">Save Changes</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
