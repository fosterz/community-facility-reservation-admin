<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

interface SubscriptionRow {
  id: string
  tenantId: string
  planId: string
  status: string
  billingCycle: string
  amount: number
  startsAt?: string
  endsAt?: string
  notes?: string
  createdAt: string
}

const router = useRouter()
const subscriptions = ref<SubscriptionRow[]>([])
const tenantMap = ref<Record<string, string>>({})
const planMap = ref<Record<string, string>>({})
const loading = ref(true)
const statusFilter = ref('')

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'PastDue', label: 'Past Due' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Expired', label: 'Expired' },
]

async function fetchAll() {
  loading.value = true
  try {
    const params = statusFilter.value ? { status: statusFilter.value } : {}
    const [subRes, tenantRes, planRes] = await Promise.all([
      api.get('/platform/subscriptions', { params }),
      api.get('/platform/tenants', { params: { limit: 500 } }),
      api.get('/platform/plans'),
    ])
    subscriptions.value = subRes.data.data ?? []
    for (const t of tenantRes.data.data?.items ?? []) tenantMap.value[t.id] = t.name
    for (const p of planRes.data.data ?? []) planMap.value[p.id] = p.name
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Subscriptions</h1>
      <div class="w-44">
        <BaseSelect v-model="statusFilter" :options="statusOptions" @update:model-value="fetchAll" />
      </div>
    </div>

    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>

    <div v-else-if="subscriptions.length === 0" class="text-center py-16 text-slate-400 text-sm">
      No subscriptions found.
    </div>

    <div v-else class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Community</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Starts</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ends</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr
            v-for="sub in subscriptions"
            :key="sub.id"
            class="hover:bg-slate-50/60 transition-colors"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900">{{ tenantMap[sub.tenantId] ?? sub.tenantId }}</p>
            </td>
            <td class="px-4 py-3 text-slate-700">{{ planMap[sub.planId] ?? sub.planId }}</td>
            <td class="px-4 py-3"><StatusBadge :status="sub.status" /></td>
            <td class="px-4 py-3 capitalize text-slate-600">{{ sub.billingCycle }}</td>
            <td class="px-4 py-3 font-medium text-slate-900">
              ₹{{ sub.amount.toLocaleString('en-IN') }}
            </td>
            <td class="px-4 py-3 text-slate-500">{{ formatDate(sub.startsAt) }}</td>
            <td class="px-4 py-3 text-slate-500">{{ formatDate(sub.endsAt) }}</td>
            <td class="px-4 py-3">
              <button
                class="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                @click="router.push(`/platform/tenants/${sub.tenantId}`)"
              >
                View Tenant
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
