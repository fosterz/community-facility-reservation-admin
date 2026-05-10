<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; width?: string }[]
  rows: unknown[]
  loading?: boolean
  emptyText?: string
}>()
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="col.width ? `width: ${col.width}` : ''"
              class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="i in 5" :key="i">
              <td v-for="col in columns" :key="col.key" class="px-4 py-3">
                <div class="h-4 bg-slate-100 rounded animate-pulse" />
              </td>
            </tr>
          </template>
          <template v-else-if="rows.length === 0">
            <tr>
              <td :colspan="columns.length" class="px-4 py-12 text-center text-slate-400">
                {{ emptyText ?? 'No records found' }}
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="(row, index) in rows"
              :key="index"
              class="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
            >
              <slot :row="row" :index="index" />
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
