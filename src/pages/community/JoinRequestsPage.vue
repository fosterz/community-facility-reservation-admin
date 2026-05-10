<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { JoinRequest } from '@/types'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const requests = ref<JoinRequest[]>([])
const loading = ref(false)
const statusFilter = ref('Pending')

const columns = [
  { key: 'applicant', label: 'Applicant' },
  { key: 'unit', label: 'Requested Unit', width: '140px' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'date', label: 'Date', width: '110px' },
  { key: 'actions', label: '', width: '140px' },
]

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
]

async function fetchRequests() {
  loading.value = true
  try {
    const { data } = await api.get('/community/join-requests', { params: { status: statusFilter.value } })
    requests.value = data.data
  } finally {
    loading.value = false
  }
}

async function approve(id: string) {
  await api.post(`/community/join-requests/${id}/approve`)
  fetchRequests()
}

async function reject(id: string) {
  const reason = prompt('Reason for rejection (optional):')
  await api.post(`/community/join-requests/${id}/reject`, { reason })
  fetchRequests()
}

onMounted(fetchRequests)

function jr(row: unknown) { return row as JoinRequest }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Join Requests</h1>
      <div class="w-40">
        <BaseSelect v-model="statusFilter" :options="statusOptions" @update:model-value="fetchRequests" />
      </div>
    </div>

    <DataTable :columns="columns" :rows="requests" :loading="loading" empty-text="No join requests found">
      <template #default="{ row }">
        <td class="px-4 py-3">
          <p class="text-sm font-medium text-slate-900">{{ jr(row).applicantName }}</p>
          <p class="text-xs text-slate-400">{{ jr(row).applicantMobile }}</p>
        </td>
        <td class="px-4 py-3 text-sm text-slate-600">{{ jr(row).unitNumber }}</td>
        <td class="px-4 py-3"><StatusBadge :status="jr(row).status" /></td>
        <td class="px-4 py-3 text-sm text-slate-500">{{ formatDate(jr(row).createdAt) }}</td>
        <td class="px-4 py-3">
          <div v-if="jr(row).status === 'Pending'" class="flex gap-2">
            <BaseButton size="sm" @click="approve(jr(row).id)">Approve</BaseButton>
            <BaseButton size="sm" variant="danger" @click="reject(jr(row).id)">Reject</BaseButton>
          </div>
        </td>
      </template>
    </DataTable>
  </div>
</template>
