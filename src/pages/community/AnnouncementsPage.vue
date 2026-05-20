<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { Announcement } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const announcements = ref<Announcement[]>([])
const loading = ref(false)
const showModal = ref(false)
const form = ref({ title: '', body: '' })
const sending = ref(false)
const error = ref('')

async function fetchAnnouncements() {
  loading.value = true
  try {
    const { data } = await api.get('/community/announcements')
    announcements.value = data.data
  } finally {
    loading.value = false
  }
}

async function sendAnnouncement() {
  error.value = ''
  sending.value = true
  try {
    await api.post('/community/announcements', form.value)
    showModal.value = false
    form.value = { title: '', body: '' }
    fetchAnnouncements()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to send announcement.'
  } finally {
    sending.value = false
  }
}

onMounted(fetchAnnouncements)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Announcements</h1>
      <BaseButton @click="showModal = true">Send Announcement</BaseButton>
    </div>

    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>
    <div v-else-if="announcements.length === 0" class="text-center py-16 text-slate-400">
      No announcements sent yet.
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="a in announcements"
        :key="a.id"
        class="bg-white rounded-xl border border-slate-200 p-5"
      >
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-slate-900">{{ a.title }}</h3>
          <span class="text-xs text-slate-400">{{ formatDate(a.sentAt) }}</span>
        </div>
        <p class="text-sm text-slate-600">{{ a.body }}</p>
        <p class="text-xs text-slate-400 mt-2">Sent to {{ a.recipientCount }} members</p>
      </div>
    </div>

    <BaseModal :open="showModal" title="Send Announcement" @close="showModal = false">
      <form @submit.prevent="sendAnnouncement" class="space-y-4">
        <BaseInput v-model="form.title" label="Title *" placeholder="Important Notice" />
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Message *</label>
          <textarea
            v-model="form.body"
            rows="4"
            placeholder="Write your announcement..."
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none"
          />
        </div>
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{{ error }}</div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
        <BaseButton :loading="sending" @click="sendAnnouncement">Send to All Members</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
