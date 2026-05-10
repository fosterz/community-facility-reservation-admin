<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import type { Tenant } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const route = useRoute()
const tenant = ref<Tenant | null>(null)
const loading = ref(true)
const statusLoading = ref(false)
const newStatus = ref('')

const statusOptions = [
  { value: 'Trial', label: 'Trial' },
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Cancelled', label: 'Cancelled' },
]

onMounted(async () => {
  try {
    const { data } = await api.get(`/platform/tenants/${route.params.id}`)
    tenant.value = data.data
    newStatus.value = data.data.status
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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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
        <!-- Info card -->
        <div class="col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address</p>
            <p class="text-sm text-slate-700">{{ tenant.address?.street }}, {{ tenant.address?.city }}, {{ tenant.address?.state }} – {{ tenant.address?.pincode }}</p>
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

        <!-- Actions -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Update Status</p>
          <BaseSelect v-model="newStatus" :options="statusOptions" />
          <BaseButton :loading="statusLoading" class="w-full" @click="updateStatus">
            Save Status
          </BaseButton>
        </div>
      </div>
    </template>
  </div>
</template>
