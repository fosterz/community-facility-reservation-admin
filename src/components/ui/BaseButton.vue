<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm',
      variant === 'secondary' ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400'
        : variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
        : variant === 'ghost' ? 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400'
        : 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500'
    ]"
  >
    <span v-if="loading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </button>
</template>
