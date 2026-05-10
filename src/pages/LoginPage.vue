<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()

const tab = ref<'platform' | 'community'>('community')
const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    if (tab.value === 'platform') {
      const result = await auth.loginPlatformAdmin(form.email, form.password)
      if (result.requiresMfa) {
        router.push('/mfa')
      } else {
        router.push('/platform/dashboard')
      }
    } else {
      await auth.loginCommunityAdmin(form.email, form.password)
      router.push('/community/dashboard')
    }
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string; errors?: string[] } } }
    error.value = e.response?.data?.message ?? e.response?.data?.errors?.[0] ?? 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">
          CFR
        </div>
        <h1 class="text-2xl font-bold text-white">Community Facility Reservation</h1>
        <p class="text-slate-400 text-sm mt-1">Admin Portal</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Tabs -->
        <div class="flex bg-slate-100 rounded-lg p-1 mb-6">
          <button
            :class="['flex-1 py-2 text-sm font-medium rounded-md transition-all', tab === 'community' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700']"
            @click="tab = 'community'"
          >
            Community Admin
          </button>
          <button
            :class="['flex-1 py-2 text-sm font-medium rounded-md transition-all', tab === 'platform' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700']"
            @click="tab = 'platform'"
          >
            Platform Admin
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <BaseInput v-model="form.email" label="Email" type="email" placeholder="you@example.com" />
          <BaseInput v-model="form.password" label="Password" type="password" placeholder="••••••••" />

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {{ error }}
          </div>

          <BaseButton type="submit" :loading="loading" class="w-full">
            Sign In
          </BaseButton>

          <p v-if="tab === 'platform'" class="text-center text-xs text-slate-400">
            Platform admin accounts require TOTP verification.
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
