<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { JoinRequest } from '@/types'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const requests = ref<JoinRequest[]>([])
const loading = ref(false)

const columns = [
  { key: 'tenant', label: 'Community' },
  { key: 'applicant', label: 'Applicant' },
  { key: 'unit', label: 'Unit' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'date', label: 'Date', width: '120px' },
  { key: 'actions', label: '', width: '140px' },
]

async function fetchRequests() {
  loading.value = true
  try {
    const { data } = await api.get('/platform/join-requests', { params: { status: 'Pending' } })
    requests.value = data.data
  } finally {
    loading.value = false
  }
}

async function approve(id: string) {
  await api.post(`/platform/join-requests/${id}/approve`)
  fetchRequests()
}

async function reject(id: string) {
  await api.post(`/platform/join-requests/${id}/reject`)
  fetchRequests()
}

onMounted(fetchRequests)

function jr(row: unknown) { return row as JoinRequest }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 mb-6">Platform Join Requests</h1>

    <DataTable :columns="columns" :rows="requests" :loading="loading" empty-text="No pending join requests">
      <template #default="{ row }">
        <td class="px-4 py-3 font-medium text-slate-900">{{ jr(row).tenantName }}</td>
        <td class="px-4 py-3">
          <p class="text-sm text-slate-700">{{ jr(row).applicantName }}</p>
          <p class="text-xs text-slate-400">{{ jr(row).applicantMobile }}</p>
        </td>
        <td class="px-4 py-3 text-sm text-slate-500">{{ jr(row).unitNumber }}</td>
        <td class="px-4 py-3"><StatusBadge :status="jr(row).status" /></td>
        <td class="px-4 py-3 text-sm text-slate-500">{{ formatDate(jr(row).createdAt) }}</td>
        <td class="px-4 py-3 flex gap-2">
          <BaseButton size="sm" @click="approve(jr(row).id)">Approve</BaseButton>
          <BaseButton size="sm" variant="danger" @click="reject(jr(row).id)">Reject</BaseButton>
        </td>
      </template>
    </DataTable>
  </div>
</template>
