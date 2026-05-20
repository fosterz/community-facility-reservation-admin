<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import type { Tenant, PagedResult } from '@/types'
import DataTable from '@/components/ui/DataTable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import CreateTenantModal from '@/components/platform/CreateTenantModal.vue'

const router = useRouter()
const result = ref<PagedResult<Tenant>>({ items: [], totalCount: 0, page: 1, limit: 20 })
const loading = ref(false)
const search = ref('')
const status = ref('')
const page = ref(1)
const showCreate = ref(false)

// Edit modal
const showEdit = ref(false)
const editSaving = ref(false)
const editError = ref('')
const editingTenant = ref<Tenant | null>(null)
const editForm = ref({
  name: '', type: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  contactPersonName: '', contactPersonEmail: '', contactPersonMobile: '',
})

const columns = [
  { key: 'name', label: 'Community' },
  { key: 'slug', label: 'Slug' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'contact', label: 'Contact' },
  { key: 'created', label: 'Created', width: '120px' },
  { key: 'actions', label: '', width: '120px' },
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Trial', label: 'Trial' },
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Expired', label: 'Expired' },
]

const typeOptions = [
  { value: 'Apartment', label: 'Apartment Complex' },
  { value: 'Villa', label: 'Villa Complex' },
  { value: 'Gated', label: 'Gated Community' },
  { value: 'Commercial', label: 'Commercial Complex' },
  { value: 'Other', label: 'Other' },
]
async function fetchTenants() {
  loading.value = true
  try {
    const { data } = await api.get('/platform/tenants', {
      params: { page: page.value, limit: 20, status: status.value || undefined, search: search.value || undefined }
    })
    result.value = data.data
  } finally {
    loading.value = false
  }
}

watch([page, status], fetchTenants)
let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; fetchTenants() }, 400)
})
onMounted(fetchTenants)

function t(row: unknown) { return row as Tenant }
function onPageChange(p: number) { page.value = p; fetchTenants() }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openEdit(tenant: Tenant) {
  editingTenant.value = tenant
  editForm.value = {
    name: tenant.name,
    type: (tenant as unknown as { type: string }).type ?? 'Apartment',
    addressLine1: tenant.address?.line1 ?? '',
    addressLine2: tenant.address?.line2 ?? '',
    city: tenant.address?.city ?? '',
    state: tenant.address?.state ?? '',
    pincode: tenant.address?.pincode ?? '',
    contactPersonName: tenant.contactPerson?.name ?? '',
    contactPersonEmail: tenant.contactPerson?.email ?? '',
    contactPersonMobile: tenant.contactPerson?.mobile ?? '',
  }
  editError.value = ''
  showEdit.value = true
}

async function saveEdit() {
  if (!editingTenant.value) return
  editSaving.value = true
  editError.value = ''
  try {
    await api.put(`/platform/tenants/${editingTenant.value.id}`, editForm.value)
    showEdit.value = false
    fetchTenants()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    editError.value = e.response?.data?.message ?? 'Failed to save.'
  } finally {
    editSaving.value = false
  }
}

async function cancelTenant(tenant: Tenant) {
  if (!confirm(`Cancel "${tenant.name}"? The community will lose access.`)) return
  await api.delete(`/platform/tenants/${tenant.id}`)
  fetchTenants()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Tenants</h1>
      <BaseButton @click="showCreate = true">+ New Tenant</BaseButton>
    </div>

    <div class="flex gap-3 mb-4">
      <div class="flex-1 max-w-xs">
        <BaseInput v-model="search" placeholder="Search communities..." />
      </div>
      <div class="w-44">
        <BaseSelect v-model="status" :options="statusOptions" placeholder="All Statuses" />
      </div>
    </div>

    <DataTable :columns="columns" :rows="result.items" :loading="loading">
      <template #default="{ row }">
        <td class="px-4 py-3">
          <p class="font-medium text-slate-900">{{ t(row).name }}</p>
          <p class="text-xs text-slate-400">{{ t(row).address?.city }}, {{ t(row).address?.state }}</p>
        </td>
        <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ t(row).slug }}</td>
        <td class="px-4 py-3"><StatusBadge :status="t(row).status" /></td>
        <td class="px-4 py-3">
          <p class="text-sm text-slate-700">{{ t(row).contactPerson?.name }}</p>
          <p class="text-xs text-slate-400">{{ t(row).contactPerson?.mobile }}</p>
        </td>
        <td class="px-4 py-3 text-sm text-slate-500">{{ formatDate(t(row).createdAt) }}</td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-2">
            <button
              class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              @click="router.push(`/platform/tenants/${t(row).id}`)"
            >View</button>
            <span class="text-slate-200">|</span>
            <button
              class="text-slate-500 hover:text-slate-800 text-sm font-medium"
              @click="openEdit(t(row))"
            >Edit</button>
            <span class="text-slate-200">|</span>
            <button
              class="text-red-500 hover:text-red-700 text-sm font-medium"
              @click="cancelTenant(t(row))"
            >Cancel</button>
          </div>
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

    <CreateTenantModal :open="showCreate" @close="showCreate = false" @created="fetchTenants" />

    <!-- Edit Modal -->
    <BaseModal :open="showEdit" title="Edit Community" size="lg" @close="showEdit = false">
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
        <BaseButton variant="secondary" @click="showEdit = false">Cancel</BaseButton>
        <BaseButton :loading="editSaving" @click="saveEdit">Save Changes</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
