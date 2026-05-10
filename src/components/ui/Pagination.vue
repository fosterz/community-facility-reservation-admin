<script setup lang="ts">
const props = defineProps<{
  page: number
  limit: number
  total: number
}>()

const emit = defineEmits<{ 'update:page': [number] }>()

const totalPages = computed(() => Math.ceil(props.total / props.limit))
const from = computed(() => (props.page - 1) * props.limit + 1)
const to = computed(() => Math.min(props.page * props.limit, props.total))

import { computed } from 'vue'
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
    <p class="text-sm text-slate-500">
      Showing <span class="font-medium">{{ from }}–{{ to }}</span> of
      <span class="font-medium">{{ total }}</span>
    </p>
    <div class="flex gap-1">
      <button
        :disabled="page <= 1"
        class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        @click="emit('update:page', page - 1)"
      >
        Previous
      </button>
      <button
        :disabled="page >= totalPages"
        class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        @click="emit('update:page', page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
