import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/api'
import type { AuthUser } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const pendingMfaUserId = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isPlatformAdmin = computed(() => user.value?.role === 'platform_admin')

  async function loginPlatformAdmin(email: string, password: string) {
    const { data } = await api.post('/auth/platform/login', { email, password })
    if (data.data.requiresMfa) {
      pendingMfaUserId.value = data.data.userId
      return { requiresMfa: true }
    }
    setTokens(data.data.accessToken, data.data.refreshToken)
    user.value = data.data.user
    return { requiresMfa: false }
  }

  async function verifyMfa(code: string) {
    const { data } = await api.post('/auth/platform/verify-mfa', {
      userId: pendingMfaUserId.value,
      code
    })
    setTokens(data.data.accessToken, data.data.refreshToken)
    user.value = data.data.user
    pendingMfaUserId.value = null
  }

  async function fetchProfile() {
    try {
      const { data } = await api.get('/auth/platform/me')
      user.value = data.data
    } catch {
      logout()
    }
  }

  function setTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  function restoreFromStorage() {
    return !!localStorage.getItem('access_token')
  }

  function logout() {
    user.value = null
    pendingMfaUserId.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return {
    user,
    pendingMfaUserId,
    isAuthenticated,
    isPlatformAdmin,
    loginPlatformAdmin,
    verifyMfa,
    fetchProfile,
    restoreFromStorage,
    logout
  }
})
