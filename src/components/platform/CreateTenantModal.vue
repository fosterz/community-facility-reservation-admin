<script setup lang="ts">
import { reactive, ref, watch, computed, nextTick } from 'vue'
import { api } from '@/lib/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const locationIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#4f46e5;border:2px solid #fff;box-shadow:0 0 0 2px #4f46e5,0 2px 6px rgba(0,0,0,.35)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [] }>()

const loading = ref(false)
const error = ref('')
const showMap = ref(false)
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
let mapMarker: L.Marker | null = null

// ── Indian geography ────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

const CITIES_BY_STATE: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Nellore'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand'],
  'Haryana': ['Gurugram', 'Faridabad', 'Ambala', 'Panipat', 'Karnal', 'Rohtak', 'Hisar', 'Sonipat'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi', 'Davanagere', 'Ballari', 'Tumakuru', 'Udupi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Pimpri-Chinchwad', 'Amravati'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Sikar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Secunderabad'],
  'Tripura': ['Agartala', 'Dharmanagar', 'Udaipur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Ghaziabad', 'Noida', 'Mathura', 'Bareilly'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Roorkee', 'Haldwani'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda'],
  'Delhi': ['New Delhi', 'Delhi'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry', 'Karaikal'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  'Ladakh': ['Leh', 'Kargil'],
  'Andaman & Nicobar Islands': ['Port Blair'],
  'Lakshadweep': ['Kavaratti'],
  'Dadra & Nagar Haveli and Daman & Diu': ['Daman', 'Silvassa', 'Diu'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
}

const stateOptions = computed(() => [
  { value: '', label: '— Select State —' },
  ...INDIAN_STATES.map(s => ({ value: s, label: s })),
])

const citySelectValue = ref('')
const cityIsOther = ref(false)

const cityOptions = computed(() => {
  const cities = CITIES_BY_STATE[form.state] ?? []
  if (cities.length === 0) return []
  return [
    { value: '', label: '— Select City —' },
    ...cities.map(c => ({ value: c, label: c })),
    { value: '__other__', label: '— Other / Type below —' },
  ]
})

watch(citySelectValue, val => {
  if (val === '__other__') {
    cityIsOther.value = true
    form.city = ''
  } else {
    cityIsOther.value = false
    form.city = val
  }
})

watch(() => form.state, () => {
  citySelectValue.value = ''
  form.city = ''
  cityIsOther.value = false
})

// ── Form ────────────────────────────────────────────────────────────────────

const typeOptions = [
  { value: 'Apartment', label: 'Apartment Complex' },
  { value: 'Villa', label: 'Villa Complex' },
  { value: 'Gated', label: 'Gated Community' },
  { value: 'Commercial', label: 'Commercial Complex' },
  { value: 'Other', label: 'Other' },
]

const form = reactive({
  name: '',
  type: 'Apartment',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  latitude: '',
  longitude: '',
  contactPersonName: '',
  contactPersonEmail: '',
  contactPersonMobile: '',
  adminEmail: '',
  adminPassword: '',
})

function resetForm() {
  Object.assign(form, {
    name: '', type: 'Apartment', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', latitude: '', longitude: '',
    contactPersonName: '', contactPersonEmail: '', contactPersonMobile: '',
    adminEmail: '', adminPassword: '',
  })
  citySelectValue.value = ''
  cityIsOther.value = false
  error.value = ''
  destroyMap()
  showMap.value = false
  mapSearch.value = ''
  mapSearchResults.value = []
}

watch(() => props.open, v => { if (v) resetForm() })

// ── Map ─────────────────────────────────────────────────────────────────────

const mapSearch = ref('')
const mapSearchResults = ref<{ display_name: string; lat: string; lon: string }[]>([])
const mapSearchLoading = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

function onMapSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!mapSearch.value.trim()) { mapSearchResults.value = []; return }
  searchTimeout = setTimeout(runSearch, 400)
}

async function runSearch() {
  mapSearchLoading.value = true
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(mapSearch.value)}&format=json&limit=5&countrycodes=in`,
      { headers: { 'Accept-Language': 'en' } }
    )
    mapSearchResults.value = await resp.json()
  } catch {
    mapSearchResults.value = []
  } finally {
    mapSearchLoading.value = false
  }
}

function selectSearchResult(r: { display_name: string; lat: string; lon: string }) {
  form.latitude = parseFloat(r.lat).toFixed(6)
  form.longitude = parseFloat(r.lon).toFixed(6)
  const latlng: L.LatLngExpression = [parseFloat(r.lat), parseFloat(r.lon)]
  if (mapInstance) {
    mapInstance.flyTo(latlng, 15)
    if (mapMarker) mapMarker.setLatLng(latlng)
    else mapMarker = L.marker(latlng, { icon: locationIcon }).addTo(mapInstance)
  }
  mapSearch.value = r.display_name
  mapSearchResults.value = []
}

function destroyMap() {
  mapInstance?.remove()
  mapInstance = null
  mapMarker = null
}

async function toggleMap() {
  showMap.value = !showMap.value
  if (!showMap.value) { destroyMap(); return }
  await nextTick()
  if (!mapContainer.value || mapInstance) return

  const center: L.LatLngExpression = form.latitude && form.longitude
    ? [parseFloat(form.latitude), parseFloat(form.longitude)]
    : [20.5937, 78.9629]

  mapInstance = L.map(mapContainer.value).setView(center, form.latitude ? 13 : 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapInstance)

  if (form.latitude && form.longitude)
    mapMarker = L.marker(center as L.LatLngExpression, { icon: locationIcon }).addTo(mapInstance)

  mapInstance.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    form.latitude = lat.toFixed(6)
    form.longitude = lng.toFixed(6)
    if (mapMarker) mapMarker.setLatLng(e.latlng)
    else mapMarker = L.marker(e.latlng, { icon: locationIcon }).addTo(mapInstance!)
  })

  setTimeout(() => mapInstance?.invalidateSize(), 150)
}

// ── Submit ───────────────────────────────────────────────────────────────────

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await api.post('/platform/tenants', {
      name: form.name,
      type: form.type,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      contactPersonName: form.contactPersonName,
      contactPersonEmail: form.contactPersonEmail,
      contactPersonMobile: form.contactPersonMobile,
      adminEmail: form.adminEmail,
      adminPassword: form.adminPassword,
    })
    emit('created')
    emit('close')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
    const apiErrors = e.response?.data?.errors
    if (apiErrors) {
      const msgs: string[] = []
      for (const arr of Object.values(apiErrors)) msgs.push(...arr)
      error.value = msgs.join(' · ')
    } else {
      error.value = e.response?.data?.message ?? 'Failed to create community.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" title="Create New Community" size="xl" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="submit">
      <!-- Basic Info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <BaseInput v-model="form.name" label="Community Name *" placeholder="e.g. Green Valley Apartments" />
        </div>
        <BaseSelect v-model="form.type" label="Community Type *" :options="typeOptions" />
      </div>

      <!-- Address -->
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Address</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <BaseInput v-model="form.addressLine1" label="Street Address *" placeholder="123, LBS Marg" />
          </div>
          <div class="col-span-2">
            <BaseInput v-model="form.addressLine2" label="Address Line 2" placeholder="Landmark, area (optional)" />
          </div>

          <!-- State dropdown -->
          <BaseSelect v-model="form.state" label="State *" :options="stateOptions" />

          <!-- City: dropdown if options exist, else free text -->
          <div>
            <template v-if="cityOptions.length > 0">
              <BaseSelect v-model="citySelectValue" label="City *" :options="cityOptions" />
              <BaseInput
                v-if="cityIsOther"
                v-model="form.city"
                class="mt-2"
                label=""
                placeholder="Type city name"
              />
            </template>
            <BaseInput
              v-else
              v-model="form.city"
              label="City *"
              placeholder="City name"
            />
          </div>

          <BaseInput v-model="form.pincode" label="Pincode *" placeholder="400071" />
        </div>
      </div>

      <!-- Location picker -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location (optional)</p>
          <button
            type="button"
            class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            @click="toggleMap"
          >
            {{ showMap ? '▲ Hide Map' : 'Pick on Map' }}
          </button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.latitude" label="Latitude" placeholder="18.9220" />
          <BaseInput v-model="form.longitude" label="Longitude" placeholder="72.8347" />
        </div>

        <div v-show="showMap" class="mt-3">
          <!-- Search bar -->
          <div class="relative mb-2">
            <input
              v-model="mapSearch"
              type="text"
              placeholder="Search for a place in India…"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
              @input="onMapSearchInput"
              @keydown.escape="mapSearchResults = []"
            />
            <span
              v-if="mapSearchLoading"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            >…</span>
            <!-- Results dropdown -->
            <div
              v-if="mapSearchResults.length > 0"
              class="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto"
              style="z-index: 10000"
            >
              <button
                v-for="r in mapSearchResults"
                :key="r.lat + r.lon"
                type="button"
                class="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 border-b border-slate-100 last:border-0"
                @click="selectSearchResult(r)"
              >
                {{ r.display_name }}
              </button>
            </div>
          </div>

          <!-- Map canvas -->
          <div class="rounded-xl overflow-hidden border border-slate-200">
            <div ref="mapContainer" style="height: 280px;" />
            <p class="text-xs text-slate-400 px-3 py-2 bg-slate-50 border-t border-slate-100">
              Search above or click on the map to pin the location
            </p>
          </div>
        </div>
      </div>

      <!-- Contact Person -->
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact Person</p>
        <div class="grid grid-cols-3 gap-4">
          <BaseInput v-model="form.contactPersonName" label="Name *" placeholder="Aditya Sharma" />
          <BaseInput v-model="form.contactPersonEmail" label="Email *" type="email" placeholder="aditya@example.com" />
          <BaseInput v-model="form.contactPersonMobile" label="Mobile *" placeholder="9876543210" />
        </div>
      </div>

      <!-- Admin Account -->
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Admin Account</p>
        <p class="text-xs text-slate-400 mb-3">
          A subscription plan can be assigned from the tenant detail page after creation.
        </p>
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.adminEmail" label="Admin Email *" type="email" placeholder="admin@community.com" />
          <BaseInput v-model="form.adminPassword" label="Admin Password *" type="password" />
        </div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        {{ error }}
      </div>
    </form>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton :loading="loading" @click="submit">Create Community</BaseButton>
    </template>
  </BaseModal>
</template>
