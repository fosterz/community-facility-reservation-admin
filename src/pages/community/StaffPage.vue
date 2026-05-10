<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { Admin } from '@/types'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const admins = ref<Admin[]>([])
const loading = ref(false)
const showModal = ref(false)
const form = ref({ name: '', email: '', password: '', role: 'Staff' })
const creating = ref(false)
const error = ref('')

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', width: '150px' },
  { key: 'status', label: 'Status', width: '100px' },
  { key: 'created', label: 'Added', width: '110px' },
]

const roleOptions = [
  { value: 'Staff', label: 'Staff' },
  { value: 'CommunityAdmin', label: 'Community Admin' },
]

async function fetchAdmins() {
  loading.value = true
  try {
    const { data } = await api.get('/community/admins')
    admins.value = data.data
  } finally {
    loading.value = false
  }
}

async function createAdmin() {
  error.value = ''
  creating.value = true
  try {
    await api.post('/community/admins', form.value)
    showModal.value = false
    form.value = { name: '', email: '', password: '', role: 'Staff' }
    fetchAdmins()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to add staff member.'
  } finally {
    creating.value = false
  }
}

onMounted(fetchAdmins)

function adm(row: unknown) { return row as Admin }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Staff & Admins</h1>
      <BaseButton @click="showModal = true">+ Add Staff</BaseButton>
    </div>

    <DataTable :columns="columns" :rows="admins" :loading="loading" empty-text="No staff members yet">
      <template #default="{ row }">
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm">
              {{ adm(row).name?.charAt(0) }}
            </div>
            <p class="font-medium text-slate-900">{{ adm(row).name }}</p>
          </div>
        </td>
        <td class="px-4 py-3 text-sm text-slate-600">{{ adm(row).email }}</td>
        <td class="px-4 py-3"><StatusBadge :status="adm(row).role" /></td>
        <td class="px-4 py-3"><StatusBadge :status="adm(row).isActive ? 'active' : 'suspended'" /></td>
        <td class="px-4 py-3 text-sm text-slate-500">{{ formatDate(adm(row).createdAt) }}</td>
      </template>
    </DataTable>

    <BaseModal :open="showModal" title="Add Staff Member" @close="showModal = false">
      <form @submit.prevent="createAdmin" class="space-y-4">
        <BaseInput v-model="form.name" label="Full Name *" placeholder="Jane Smith" />
        <BaseInput v-model="form.email" label="Email *" type="email" placeholder="staff@example.com" />
        <BaseInput v-model="form.password" label="Password *" type="password" />
        <BaseSelect v-model="form.role" label="Role" :options="roleOptions" />
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{{ error }}</div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
        <BaseButton :loading="creating" @click="createAdmin">Add Staff</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
