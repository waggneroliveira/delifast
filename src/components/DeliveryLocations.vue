<template>
  <div>
    <!-- Modal -->
    <div class="modal fade show" tabindex="-1" style="display: block;" v-if="show" @click.self="close">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <!-- Cabeçalho -->
          <div class="modal-header border-bottom px-4 py-3 align-items-center">
            <div class="d-flex align-items-center gap-3">
              <div class="icon-wrapper rounded-3 d-flex align-items-center justify-content-center">
                <svg class="icon-location" width="22" height="27" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 0C7.62838 0 0 7.27149 0 16.2047C0 20.62 1.6795 24.8739 4.71769 28.1973L17 41.5667L29.2823 28.1973C32.3205 24.8758 34 20.6219 34 16.2047C34 7.27149 26.3716 0 17 0ZM17 22.2836C13.4717 22.2836 10.6247 19.5699 10.6247 16.2066C10.6247 12.8434 13.4717 10.1296 17 10.1296C20.5283 10.1296 23.3753 12.8434 23.3753 16.2066C23.3753 19.5699 20.5283 22.2836 17 22.2836Z" fill="#595959"/>
                </svg>
              </div>
              <div>
                <h5 class="mb-0 location-title">Locais de entrega</h5>
                <p class="small text-muted mb-0">
                  Confira os bairros atendidos e as taxas de entrega
                </p>
              </div>
            </div>
            <button type="button" class="btn-close" @click="close" aria-label="Fechar"></button>
          </div>

          <!-- Corpo do Modal -->
          <div class="modal-body px-4 py-4">

            <!-- Card Unificado: Endereço + Tempo de Entrega -->
            <div class="info-card border rounded-3 p-3 mb-4 bg-light bg-opacity-50">
              <div class="row g-3 align-items-center">
                <!-- Endereço -->
                <div class="col-12 col-md-8 d-flex gap-3 align-items-start">
                  <div class="mt-1 flex-shrink-0">
                    <svg width="28" height="22" viewBox="0 0 39 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M36.4453 6.97266C38.3789 10.1367 36.6211 14.4727 32.9883 14.9414C32.6953 15 32.4609 15 32.168 15C30.4102 15 28.8867 14.2383 27.832 13.0664C26.7773 14.2383 25.2539 15 23.4961 15C21.7969 15 20.2148 14.2383 19.1602 13.0664C18.1055 14.2383 16.582 15 14.8828 15C13.125 15 11.6016 14.2383 10.5469 13.0664C9.49219 14.2383 7.96875 15 6.21094 15C5.91797 15 5.68359 15 5.39062 14.9414C1.75781 14.4727 0 10.1367 1.99219 6.97266L5.74219 0.878906C6.09375 0.351562 6.73828 0 7.38281 0H31.0547C31.6992 0 32.2852 0.351562 32.6367 0.878906L36.4453 6.97266ZM32.168 16.875C32.5195 16.875 32.8711 16.875 33.2227 16.8164C33.5742 16.8164 33.8672 16.6992 34.2188 16.6406V28.125C34.2188 29.1797 33.3398 30 32.3438 30H6.09375C5.03906 30 4.21875 29.1797 4.21875 28.125V16.6406C4.51172 16.6992 4.80469 16.7578 5.15625 16.8164C5.50781 16.875 5.85938 16.875 6.21094 16.875C6.79688 16.875 7.38281 16.8164 7.96875 16.6992V22.5H30.4688V16.6992C30.9961 16.8164 31.582 16.875 32.168 16.875Z" fill="var(--bg-orange)"/>
                    </svg>
                  </div>
                  <div>
                    <span class="d-block fw-semibold small text-dark mb-1">Ponto de partida (Nosso Endereço)</span>
                    <p class="mb-0 small text-muted lh-sm">
                      Rua Heróis de França 886, 4450-156 Porto, Portugal. Próximo à estátua da liberdade, entre a padaria e o posto de combustível.
                    </p>
                  </div>
                </div>

                <!-- Tempo Estimado -->
                <div class="col-12 col-md-4 border-md-start ps-md-3">
                  <div class="d-flex align-items-center gap-2 bg-white border rounded-3 px-3 py-2">
                    <i class="bi bi-clock-fill fs-5"></i>
                    <div>
                      <span class="d-block text-muted" style="font-size: 0.7rem;">Tempo estimado</span>
                      <strong class="small text-dark">30-45 minutos</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estados de Carregamento / Erro -->
            <div v-if="isLoading" class="alert alert-info mb-0" role="status">
              Carregando locais de entrega...
            </div>
            <div v-else-if="loadError" class="alert alert-danger mb-0" role="alert">
              {{ loadError }}
            </div>
            <div v-else-if="!areas.length" class="alert alert-light text-center border mb-0" role="status">
              Nenhum local de entrega cadastrado.
            </div>

            <!-- Lista de Áreas e Bairros -->
            <template v-else>
              <div class="neighborhood-search-panel rounded-3 p-3 mb-4">
                <label for="neighborhood-search" class="form-label fw-bold mb-2">
                  Encontre seu bairro
                </label>
                <div class="position-relative">
                  <i class="bi bi-search neighborhood-search-icon" aria-hidden="true"></i>
                  <input
                    id="neighborhood-search"
                    v-model="searchQuery"
                    type="search"
                    class="form-control form-control-lg neighborhood-search-input"
                    placeholder="Ex.: Centro, Vila..."
                    autocomplete="off"
                  >
                </div>
                <small class="d-block text-muted mt-2">
                  Digite o nome do bairro para consultar a taxa de entrega.
                </small>
              </div>

              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="small fw-semibold text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-check-circle-fill text-success"></i> Bairros atendidos por região
                </span>
              </div>

              <div
                v-for="(area, index) in filteredAreas"
                :key="area.id"
                :class="{ 'mb-4': index !== filteredAreas.length - 1 }"
              >
                <div class="area-header d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                  <i class="bi bi-geo-alt-fill"></i>
                  <h6 class="mb-0 fw-semibold text-dark">{{ area.title }}</h6>
                </div>

                <div class="row g-2">
                  <div
                    v-for="neighborhood in area.neighborhoods"
                    :key="`${area.id}-${neighborhood.name}`"
                    class="col-12 col-sm-6"
                  >
                    <div class="neighborhood-item border rounded-3 px-3 py-2 d-flex justify-content-between align-items-center bg-white h-100">
                      <!-- Nome com quebra de linha natural (sem cortar) -->
                      <span class="name pe-2">
                        {{ neighborhood.name }}
                      </span>
                      <span class="value text-primary flex-shrink-0 bg-light px-2 py-1 rounded-2">
                        {{ formatDeliveryFee(neighborhood.delivery_fee) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p v-if="!filteredAreas.length" class="text-muted text-center mb-0" role="status">
                Nenhum bairro encontrado para essa busca.
              </p>
            </template>

          </div>
        </div>
      </div>
    </div>

    <!-- Fundo do modal -->
    <div v-if="show" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.location-title {
  font-weight: 600;
  color: #595959;
  font-size: 1.15rem;
}

.icon-wrapper {
  width: 42px;
  height: 42px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  flex-shrink: 0;
}

.neighborhood-search-panel {
  background-color: #fffaf3;
  border: 1px solid #ffd9a8;
}

.neighborhood-search-panel label {
  color: #595959;
}

.neighborhood-search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  z-index: 2;
  color: #e88700;
  font-size: 1.1rem;
  transform: translateY(-50%);
  pointer-events: none;
}

.neighborhood-search-input {
  min-height: 3.25rem;
  padding-left: 3rem;
  border: 2px solid #f2a23a;
  font-size: 1rem;
  font-weight: 500;
}

.neighborhood-search-input:focus {
  border-color: #e88700;
  box-shadow: 0 0 0 0.2rem rgb(255 152 0 / 18%);
}

.bi {
  color: #FF9800;
}

.neighborhood-item {
  transition: border-color 0.2s ease, transform 0.15s ease;
  min-height: 48px;
}

.neighborhood-item:hover {
  border-color: #FF9800 !important;
}

.name {
  font-size: 0.813rem;
  font-weight: 600;
  color: #595959;
  line-height: 1.25;
  word-break: break-word; /* Garante que palavras longas quebrem certinho sem cortar */
}

.value {
  font-size: 0.813rem;
  font-weight: 700;
}

.modal-backdrop {
  z-index: 1040;
}

.modal-content {
  z-index: 1050;
}

@media (min-width: 768px) {
  .border-md-start {
    border-left: 1px solid #dee2e6 !important;
  }
}

@media (max-width: 476px) {
  .location-title {
    font-size: 1rem;
  }
  .small.text-muted.mb-0 {
    font-size: 0.75rem !important;
  }
  .icon-wrapper {
    width: 36px;
    height: 36px;
  }
  .icon-location {
    width: 16px;
    height: 20px;
  }
  .name, .value {
    font-size: 0.75rem;
  }
}
</style>

<script setup>
    import { computed, ref, watch } from 'vue'
    import { getServiceLocations } from '@/services/api'

    const props = defineProps({
    modelValue: Boolean
    })
    const emit = defineEmits(['update:modelValue'])

    const areas = ref([])
    const isLoading = ref(false)
    const loadError = ref('')
    const searchQuery = ref('')
    let hasLoaded = false

    const show = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
    })

    function close() {
    show.value = false
    }

    const formatDeliveryFee = (fee) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(fee))

    const normalizeSearchText = (value) => String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

    const filteredAreas = computed(() => {
        const query = normalizeSearchText(searchQuery.value.trim())
        if (!query) return areas.value

        return areas.value
            .map((area) => ({
                ...area,
                neighborhoods: area.neighborhoods.filter((neighborhood) => (
                    normalizeSearchText(neighborhood.name).includes(query)
                )),
            }))
            .filter((area) => area.neighborhoods.length)
    })

    const loadAreas = async () => {
        isLoading.value = true
        loadError.value = ''

        try {
            const locations = await getServiceLocations()
            areas.value = locations.map((location) => {
                if (
                    !location
                    || location.id == null
                    || typeof location.title !== 'string'
                    || !location.title.trim()
                    || (location.neighborhoods != null && !Array.isArray(location.neighborhoods))
                ) {
                    throw new Error('A resposta de /service-locations contém um local inválido.')
                }

                const neighborhoods = location.neighborhoods || []
                if (neighborhoods.some((neighborhood) => (
                    !neighborhood
                    || typeof neighborhood.name !== 'string'
                    || !neighborhood.name.trim()
                    || !Number.isFinite(Number(neighborhood.delivery_fee))
                ))) {
                    throw new Error('A resposta de /service-locations contém um bairro inválido.')
                }

                return { ...location, neighborhoods }
            })
            hasLoaded = true
        } catch (error) {
            console.error('Não foi possível carregar os locais de entrega da API.', error)
            loadError.value = 'Não foi possível carregar os locais de entrega.'
        } finally {
            isLoading.value = false
        }
    }

    watch(
        () => props.modelValue,
        (isOpen) => {
            if (isOpen && !hasLoaded && !isLoading.value) {
                loadAreas()
            }
        },
        { immediate: true },
    )
</script>

