<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api } from '@/lib/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [] }>()

const form = reactive({ name: '', mobile: '', email: '', unit: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await api.post('/community/members', form)
    emit('created')
    emit('close')
    Object.assign(form, { name: '', mobile: '', email: '', unit: '', password: '' })
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to create member.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" title="Add New Member" @close="emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <BaseInput v-model="form.name" label="Full Name *" placeholder="John Doe" />
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.mobile" label="Mobile *" placeholder="9876543210" />
        <BaseInput v-model="form.unit" label="Unit / Flat No. *" placeholder="A-102" />
      </div>
      <BaseInput v-model="form.email" label="Email (optional)" type="email" placeholder="member@email.com" />
      <BaseInput v-model="form.password" label="Temporary Password *" type="password" placeholder="Min 8 characters" />
      <p class="text-xs text-slate-400">Member will be prompted to change password on first login.</p>
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{{ error }}</div>
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton :loading="loading" @click="submit">Add Member</BaseButton>
    </template>
  </BaseModal>
</template>
