<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import type { Member, PagedResult } from '@/types'
import DataTable from '@/components/ui/DataTable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CreateMemberModal from '@/components/community/CreateMemberModal.vue'

const router = useRouter()
const result = ref<PagedResult<Member>>({ items: [], totalCount: 0, page: 1, limit: 20 })
const loading = ref(false)
const search = ref('')
const status = ref('')
const page = ref(1)
const showCreate = ref(false)

const columns = [
  { key: 'member', label: 'Member' },
  { key: 'id', label: 'Membership ID', width: '160px' },
  { key: 'unit', label: 'Unit', width: '100px' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'joined', label: 'Joined', width: '110px' },
  { key: 'actions', label: '', width: '80px' },
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Pending', label: 'Pending' },
]

async function fetchMembers() {
  loading.value = true
  try {
    const { data } = await api.get('/community/members', {
      params: { page: page.value, limit: 20, status: status.value || undefined, search: search.value || undefined }
    })
    result.value = data.data
  } finally {
    loading.value = false
  }
}

watch([page, status], fetchMembers)
let timer: ReturnType<typeof setTimeout>
watch(search, () => { clearTimeout(timer); timer = setTimeout(() => { page.value = 1; fetchMembers() }, 400) })

onMounted(fetchMembers)

function m(row: unknown) { return row as Member }
function onPageChange(p: number) { page.value = p; fetchMembers() }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Members</h1>
      <div class="flex gap-2">
        <BaseButton variant="secondary">Import CSV</BaseButton>
        <BaseButton @click="showCreate = true">+ Add Member</BaseButton>
      </div>
    </div>

    <div class="flex gap-3 mb-4">
      <div class="flex-1 max-w-xs">
        <BaseInput v-model="search" placeholder="Search by name, mobile, unit..." />
      </div>
      <div class="w-40">
        <BaseSelect v-model="status" :options="statusOptions" />
      </div>
    </div>

    <DataTable :columns="columns" :rows="result.items" :loading="loading">
      <template #default="{ row }">
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
              {{ m(row).name?.charAt(0) }}
            </div>
            <div>
              <p class="font-medium text-slate-900">{{ m(row).name }}</p>
              <p class="text-xs text-slate-400">{{ m(row).mobile }}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ m(row).membershipId }}</td>
        <td class="px-4 py-3 text-sm text-slate-600">{{ m(row).unit }}</td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-2">
            <StatusBadge :status="m(row).status" />
            <span v-if="m(row).forcePasswordChange" title="Password reset pending" class="text-amber-500 text-xs">🔑</span>
          </div>
        </td>
        <td class="px-4 py-3 text-sm text-slate-500">{{ formatDate(m(row).createdAt) }}</td>
        <td class="px-4 py-3">
          <button
            class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            @click="router.push(`/community/members/${m(row).id}`)"
          >
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

    <CreateMemberModal :open="showCreate" @close="showCreate = false" @created="fetchMembers" />
  </div>
</template>
