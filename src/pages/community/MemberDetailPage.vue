<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import type { Member } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const route = useRoute()
const member = ref<Member | null>(null)
const loading = ref(true)
const newPassword = ref('')
const resetLoading = ref(false)
const suspendLoading = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get(`/community/members/${route.params.id}`)
    member.value = data.data
  } finally {
    loading.value = false
  }
})

async function resetPassword() {
  if (!newPassword.value || !member.value) return
  resetLoading.value = true
  try {
    await api.post(`/community/members/${member.value.id}/reset-password`, { newPassword: newPassword.value })
    newPassword.value = ''
    alert('Password reset successfully.')
  } finally {
    resetLoading.value = false
  }
}

async function toggleSuspend() {
  if (!member.value) return
  suspendLoading.value = true
  try {
    const action = member.value.status === 'Suspended' ? 'activate' : 'suspend'
    await api.patch(`/community/members/${member.value.id}/status`, { status: action === 'activate' ? 'Active' : 'Suspended' })
    member.value.status = action === 'activate' ? 'Active' : 'Suspended'
  } finally {
    suspendLoading.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>
    <template v-else-if="member">
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
            {{ member.name?.charAt(0) }}
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h1 class="text-xl font-bold text-slate-900">{{ member.name }}</h1>
              <StatusBadge :status="member.status" />
              <span v-if="member.forcePasswordChange" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Password Reset Pending</span>
            </div>
            <p class="text-sm text-slate-500">{{ member.membershipId }} · Unit {{ member.unit }} · {{ member.mobile }}</p>
          </div>
        </div>
        <BaseButton
          :variant="member.status === 'Suspended' ? 'primary' : 'danger'"
          :loading="suspendLoading"
          @click="toggleSuspend"
        >
          {{ member.status === 'Suspended' ? 'Activate' : 'Suspend' }}
        </BaseButton>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Member Info</p>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><p class="text-slate-400">Name</p><p class="font-medium text-slate-900">{{ member.name }}</p></div>
            <div><p class="text-slate-400">Mobile</p><p class="font-medium text-slate-900">{{ member.mobile }}</p></div>
            <div><p class="text-slate-400">Email</p><p class="font-medium text-slate-900">{{ member.email || '—' }}</p></div>
            <div><p class="text-slate-400">Unit</p><p class="font-medium text-slate-900">{{ member.unit }}</p></div>
            <div><p class="text-slate-400">Joined</p><p class="font-medium text-slate-900">{{ formatDate(member.createdAt) }}</p></div>
            <div><p class="text-slate-400">Membership ID</p><p class="font-mono text-slate-700">{{ member.membershipId }}</p></div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Reset Password</p>
          <div class="space-y-3">
            <BaseInput v-model="newPassword" label="New Password" type="password" placeholder="Min 8 characters" />
            <BaseButton :loading="resetLoading" class="w-full" @click="resetPassword">Reset Password</BaseButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
