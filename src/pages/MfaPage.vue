<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()
const code = ref('')
const error = ref('')
const loading = ref(false)

async function verify() {
  error.value = ''
  loading.value = true
  try {
    await auth.verifyMfa(code.value)
    router.push('/platform/dashboard')
  } catch {
    error.value = 'Invalid verification code. Please try again.'
    code.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-6">
          <div class="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900">Two-Factor Authentication</h2>
          <p class="text-slate-500 text-sm mt-1">Enter the 6-digit code from your authenticator app</p>
        </div>

        <form @submit.prevent="verify" class="space-y-4">
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            class="w-full text-center text-3xl font-mono tracking-widest px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
          />

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {{ error }}
          </div>

          <BaseButton type="submit" :loading="loading" class="w-full" :disabled="code.length !== 6">
            Verify
          </BaseButton>

          <button type="button" class="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors" @click="router.push('/login')">
            Back to Login
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
