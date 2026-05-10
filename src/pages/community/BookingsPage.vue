<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import type { Booking, PagedResult } from '@/types'
import DataTable from '@/components/ui/DataTable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const router = useRouter()
const result = ref<PagedResult<Booking>>({ items: [], totalCount: 0, page: 1, limit: 20 })
const loading = ref(false)
const search = ref('')
const status = ref('')
const date = ref('')
const page = ref(1)

const columns = [
  { key: 'ref', label: 'Booking Ref', width: '140px' },
  { key: 'member', label: 'Member' },
  { key: 'facility', label: 'Facility' },
  { key: 'date', label: 'Date', width: '100px' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'payment', label: 'Payment', width: '110px' },
  { key: 'amount', label: 'Amount', width: '90px' },
  { key: 'actions', label: '', width: '80px' },
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'NoShow', label: 'No Show' },
  { value: 'Waitlisted', label: 'Waitlisted' },
]

async function fetchBookings() {
  loading.value = true
  try {
    const { data } = await api.get('/community/bookings', {
      params: { page: page.value, limit: 20, status: status.value || undefined, date: date.value || undefined, search: search.value || undefined }
    })
    result.value = data.data
  } finally {
    loading.value = false
  }
}

watch([page, status, date], fetchBookings)
let timer: ReturnType<typeof setTimeout>
watch(search, () => { clearTimeout(timer); timer = setTimeout(() => { page.value = 1; fetchBookings() }, 400) })
onMounted(fetchBookings)

function b(row: unknown) { return row as Booking }
function onPageChange(p: number) { page.value = p; fetchBookings() }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Bookings</h1>
    </div>

    <div class="flex gap-3 mb-4">
      <div class="flex-1 max-w-xs">
        <BaseInput v-model="search" placeholder="Search by member, facility..." />
      </div>
      <div class="w-40">
        <BaseSelect v-model="status" :options="statusOptions" />
      </div>
      <input
        v-model="date"
        type="date"
        class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
      />
    </div>

    <DataTable :columns="columns" :rows="result.items" :loading="loading">
      <template #default="{ row }">
        <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ b(row).bookingRef }}</td>
        <td class="px-4 py-3">
          <p class="text-sm font-medium text-slate-900">{{ b(row).memberName }}</p>
          <p class="text-xs text-slate-400">Unit {{ b(row).memberUnit }}</p>
        </td>
        <td class="px-4 py-3 text-sm text-slate-700">{{ b(row).facilityName }}</td>
        <td class="px-4 py-3 text-sm text-slate-500">{{ formatDate(b(row).date) }}</td>
        <td class="px-4 py-3"><StatusBadge :status="b(row).status" /></td>
        <td class="px-4 py-3"><StatusBadge :status="b(row).paymentStatus" /></td>
        <td class="px-4 py-3 text-sm text-slate-700">
          <span v-if="b(row).amountDue > 0">₹{{ b(row).amountDue }}</span>
          <span v-else class="text-slate-400">—</span>
        </td>
        <td class="px-4 py-3">
          <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium" @click="router.push(`/community/bookings/${b(row).id}`)">
            View
          </button>
        </td>
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
