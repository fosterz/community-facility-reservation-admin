<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string | number | null | undefined }>()

const colorMap: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  trial: 'bg-blue-100 text-blue-700',
  suspended: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-slate-100 text-slate-600',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-indigo-100 text-indigo-700',
  waitlisted: 'bg-orange-100 text-orange-700',
  noshow: 'bg-red-100 text-red-700',
  free: 'bg-slate-100 text-slate-600',
  paid: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  maintenance: 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-600',
  pastdue: 'bg-orange-100 text-orange-700',
  staff: 'bg-sky-100 text-sky-700',
  communityadmin: 'bg-purple-100 text-purple-700',
}

const label = computed(() => String(props.status ?? ''))
const color = computed(() => colorMap[label.value.toLowerCase().replace(/\s/g, '')] ?? 'bg-slate-100 text-slate-600')
</script>

<template>
  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize', color]">
    {{ label || '—' }}
  </span>
</template>
