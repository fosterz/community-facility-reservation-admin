<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{
  label: string
  value: string | number
  icon: string
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'
  change?: string
  changeType?: 'up' | 'down'
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
    <div
      :class="[
        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
        color === 'emerald' ? 'bg-emerald-100 text-emerald-600'
          : color === 'amber' ? 'bg-amber-100 text-amber-600'
          : color === 'rose' ? 'bg-rose-100 text-rose-600'
          : color === 'sky' ? 'bg-sky-100 text-sky-600'
          : 'bg-indigo-100 text-indigo-600'
      ]"
    >
      <AppIcon :name="icon" size="lg" />
    </div>
    <div class="min-w-0">
      <p class="text-sm text-slate-500 truncate">{{ label }}</p>
      <p class="text-2xl font-bold text-slate-900">{{ value }}</p>
      <p v-if="change" :class="changeType === 'up' ? 'text-emerald-600' : 'text-red-500'" class="text-xs font-medium">
        {{ changeType === 'up' ? '↑' : '↓' }} {{ change }}
      </p>
    </div>
  </div>
</template>
