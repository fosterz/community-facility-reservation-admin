<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { api } from '@/lib/api'
import type { Invoice, PagedResult } from '@/types'
import DataTable from '@/components/ui/DataTable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const result = ref<PagedResult<Invoice>>({ items: [], totalCount: 0, page: 1, limit: 20 })
const loading = ref(false)
const search = ref('')
const page = ref(1)

const columns = [
  { key: 'no', label: 'Invoice No', width: '150px' },
  { key: 'booking', label: 'Booking Ref', width: '140px' },
  { key: 'member', label: 'Member' },
  { key: 'facility', label: 'Facility' },
  { key: 'subtotal', label: 'Subtotal', width: '100px' },
  { key: 'tax', label: 'Tax', width: '80px' },
  { key: 'total', label: 'Total', width: '100px' },
  { key: 'date', label: 'Paid At', width: '110px' },
]

async function fetchInvoices() {
  loading.value = true
  try {
    const { data } = await api.get('/community/invoices', {
      params: { page: page.value, limit: 20, search: search.value || undefined }
    })
    result.value = data.data
  } finally {
    loading.value = false
  }
}

watch(page, fetchInvoices)
let timer: ReturnType<typeof setTimeout>
watch(search, () => { clearTimeout(timer); timer = setTimeout(() => { page.value = 1; fetchInvoices() }, 400) })
onMounted(fetchInvoices)

function onPageChange(p: number) { page.value = p; fetchInvoices() }
function inv(row: unknown) { return row as Invoice }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Invoices</h1>
    </div>

    <div class="mb-4 max-w-xs">
      <BaseInput v-model="search" placeholder="Search by member, invoice no..." />
    </div>

    <DataTable :columns="columns" :rows="result.items" :loading="loading">
      <template #default="{ row }">
        <td class="px-4 py-3 font-mono text-xs font-medium text-indigo-600">{{ inv(row).invoiceNo }}</td>
        <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ inv(row).bookingRef }}</td>
        <td class="px-4 py-3">
          <p class="text-sm font-medium text-slate-900">{{ inv(row).memberName }}</p>
          <p class="text-xs text-slate-400">Unit {{ inv(row).memberUnit }}</p>
        </td>
        <td class="px-4 py-3 text-sm text-slate-700">{{ inv(row).facilityName }}</td>
        <td class="px-4 py-3 text-sm text-slate-700">₹{{ inv(row).subtotal }}</td>
        <td class="px-4 py-3 text-sm text-slate-500">₹{{ inv(row).taxAmount }}</td>
        <td class="px-4 py-3 text-sm font-semibold text-slate-900">₹{{ inv(row).total }}</td>
        <td class="px-4 py-3 text-sm text-slate-500">{{ formatDate(inv(row).paidAt) }}</td>
      </template>
    </DataTable>

    <Pagination
      v-if="result.totalCount > 0"
      :page="result.page"
      :limit="result.limit"
      :total="result.totalCount"
      @update:page="onPageChange"
    />
  </div>
</template>
