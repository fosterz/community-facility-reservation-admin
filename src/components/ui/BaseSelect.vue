<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<string | number>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-slate-700">{{ label }}</label>
    <select
      v-model="model"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none bg-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
          : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
      ]"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
