<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { api } from '@/lib/api'
import type { TenantSettings } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const activeTab = ref<'profile' | 'documents' | 'billing' | 'policies'>('profile')

const settings = reactive<TenantSettings>({
  communityProfile: { description: '', logoUrl: '', bannerUrl: '', website: '' },
  documentPrefixes: { membershipId: 'MBR', bookingRef: 'BKG', invoiceNo: 'INV', receiptNo: 'RCP' },
  invoiceSettings: { taxPercent: 0, footerNote: '' },
  bookingPolicies: { requireApproval: false, allowGuestBooking: false, guestFeePercent: 0 },
})

onMounted(async () => {
  try {
    const { data } = await api.get('/community/settings')
    Object.assign(settings, data.data)
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    await api.put('/community/settings', settings)
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } finally {
    saving.value = false
  }
}

const tabs = [
  { key: 'profile', label: 'Community Profile' },
  { key: 'documents', label: 'Document Numbering' },
  { key: 'billing', label: 'Invoice & Billing' },
  { key: 'policies', label: 'Booking Policies' },
] as const
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Settings</h1>
      <div class="flex items-center gap-3">
        <span v-if="saved" class="text-emerald-600 text-sm font-medium">✓ Saved</span>
        <BaseButton :loading="saving" @click="save">Save Changes</BaseButton>
      </div>
    </div>

    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>
    <div v-else class="flex gap-6">
      <!-- Tab list -->
      <div class="w-52 flex-shrink-0">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="[
              'w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors',
              activeTab === tab.key ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
            ]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab content -->
      <div class="flex-1 bg-white rounded-xl border border-slate-200 p-6">
        <!-- Profile -->
        <div v-if="activeTab === 'profile'" class="space-y-4">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Community Profile</p>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Description</label>
            <textarea v-model="settings.communityProfile.description" rows="3" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none" />
          </div>
          <BaseInput v-model="settings.communityProfile.website" label="Website URL" placeholder="https://yourwebsite.com" />
        </div>

        <!-- Document Prefixes -->
        <div v-if="activeTab === 'documents'" class="space-y-4">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Document Number Prefixes</p>
          <p class="text-sm text-slate-500 mb-4">These prefixes are used for auto-generated document IDs (e.g. MBR-2026-00001).</p>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="settings.documentPrefixes.membershipId" label="Membership ID Prefix" placeholder="MBR" />
            <BaseInput v-model="settings.documentPrefixes.bookingRef" label="Booking Ref Prefix" placeholder="BKG" />
            <BaseInput v-model="settings.documentPrefixes.invoiceNo" label="Invoice No Prefix" placeholder="INV" />
            <BaseInput v-model="settings.documentPrefixes.receiptNo" label="Receipt No Prefix" placeholder="RCP" />
          </div>
        </div>

        <!-- Invoice -->
        <div v-if="activeTab === 'billing'" class="space-y-4">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Invoice Settings</p>
          <BaseInput v-model.number="settings.invoiceSettings.taxPercent" label="Tax Percent (%)" type="number" placeholder="0" />
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Invoice Footer Note</label>
            <textarea v-model="settings.invoiceSettings.footerNote" rows="2" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none" />
          </div>
        </div>

        <!-- Policies -->
        <div v-if="activeTab === 'policies'" class="space-y-4">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Booking Policies</p>
          <div class="flex items-center gap-3">
            <input id="guestBooking" v-model="settings.bookingPolicies.allowGuestBooking" type="checkbox" class="rounded" />
            <label for="guestBooking" class="text-sm text-slate-700">Allow guest bookings</label>
          </div>
          <BaseInput v-if="settings.bookingPolicies.allowGuestBooking" v-model.number="settings.bookingPolicies.guestFeePercent" label="Guest Fee Surcharge (%)" type="number" />
          <div class="flex items-center gap-3">
            <input id="requireApproval" v-model="settings.bookingPolicies.requireApproval" type="checkbox" class="rounded" />
            <label for="requireApproval" class="text-sm text-slate-700">Require admin approval for bookings</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
