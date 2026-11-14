<template>
  <div
    v-if="modelValue && userStore.isLogged"
    class="modal fade show"
    tabindex="-1"
    style="display: block; background: rgba(0,0,0,.5)"
    @click.self="close"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">

        <!-- HEADER -->
        <div class="modal-header py-2">
            <h5 class="modal-title">
                <i class="bi bi-geo-alt me-2"></i>Meus Endereços
            </h5>
            <button type="button" class="btn-close" @click="close"></button>
        </div>

        <div class="modal-body">

          <!-- LISTA -->
          <div v-if="view === 'list'" class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="address-title">Endereços cadastrados</h6>
                <!-- No lugar do botão Novo Endereço existente -->
                <button
                    v-if="addresses.length < 2"
                    class="btn btn-outline-primary btn-sm"
                    @click="showForm"
                    :disabled="isLoadingAddresses || isSaving"
                >
                    <i class="bi bi-plus"></i> Novo Endereço
                </button>
            </div>

            <div v-if="loadError" class="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
              <span>{{ loadError }}</span>
              <button class="btn btn-sm btn-outline-danger ms-2" @click="loadAddresses()">
                Tentar novamente
              </button>
            </div>

            <div v-else-if="isLoadingAddresses" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando endereços...</span>
              </div>
            </div>

            <div v-else class="row g-3">
              <div class="col-md-6" v-for="addr in addresses" :key="addr.id">
                <div
                  class="card address-card"
                  :class="{ selected: String(selectedId) === String(addr.id) }"
                  @click="selectAddress(addr.id)"
                >
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                      <h6 class="card-title">{{ addr.nickname }}</h6>
                      <span class="badge text-black px-3" :class="addr.primary ? 'bg-primary text-white' : 'bg-secondary'">
                        {{ addr.primary ? 'Principal' : 'Secundário' }}
                      </span>
                    </div>

                    <p v-if="addr.recipientName" class="card-text small mb-1">{{ addr.recipientName }}</p>
                    <p class="card-text small mb-1">{{ addr.street }}, {{ addr.number }}</p>
                    <p class="card-text small mb-1">{{ addr.neighborhood }}</p>
                    <p class="card-text small mb-1">
                      {{ addr.city }} - {{ addr.state }}, {{ addr.cep }}
                    </p>

                    <div class="mt-2">
                      <button class="btn btn-sm btn-outline-secondary me-1" :disabled="isSaving" @click.stop="editAddress(addr.id)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" :disabled="isSaving" @click.stop="deleteAddress(addr.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FORM -->
          <div v-else>
            <div v-if="loadError" class="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
              <span>{{ loadError }}</span>
              <button class="btn btn-sm btn-outline-danger ms-2" @click="loadAddresses({ showFormWhenEmpty: false })">
                Tentar novamente
              </button>
            </div>

            <div class="progress">
              <div
                class="progress-bar"
                :style="{ width: step === 1 ? '50%' : '100%' }"
              ></div>
            </div>

            <!-- STEP 1 -->
            <div class="form-step mt-3 active" v-if="step === 1">
              <h6 class="mb-3">Informações do Endereço</h6>

              <div class="row g-3">

                <div class="col-md-6">
                  <label class="form-label">Apelido do Endereço</label>
                  <input v-model="form.nickname" class="form-control" placeholder="Ex: Casa, Trabalho...">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Nome de quem recebe</label>
                  <input v-model="form.recipientName" class="form-control" autocomplete="name" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">CEP</label>
                  <div class="input-group">
                    <input
                      v-model="form.cep"
                      class="form-control"
                      maxlength="9"
                      @input="handleCepInput"
                    >
                  </div>

                  <div class="cep-loading mt-1" v-show="loadingCEP">
                    <small class="text-muted">Buscando CEP...</small>
                  </div>
                </div>

                <div class="col-md-8">
                  <label class="form-label">Rua</label>
                  <input v-model="form.street" class="form-control">
                </div>

                <div class="col-md-4">
                  <label class="form-label">Número</label>
                  <input v-model="form.number" class="form-control">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Complemento</label>
                  <input v-model="form.complement" class="form-control" placeholder="Apto, Bloco, etc.">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Bairro</label>
                  <input v-model="form.neighborhood" class="form-control">
                </div>

                <div class="col-md-8">
                  <label class="form-label">Cidade</label>
                  <input v-model="form.city" class="form-control">
                </div>

                <div class="col-md-4">
                  <label class="form-label">Estado</label>
                  <select v-model="form.state" class="form-select">
                    <option value="">Selecione</option>
                    <option v-for="state in brazilStates" :key="state" :value="state">
                      {{ state }}
                    </option>
                  </select>
                </div>

              </div>

              <div class="d-flex justify-content-between mt-4">
                <button class="btn bg-light" @click="showList">
                  Voltar
                </button>
                <button class="btn bg-yellow fw-medium" @click="nextStep">
                  Continuar
                </button>
              </div>
            </div>

            <!-- STEP 2 -->
            <div class="form-step mt-3" v-if="step === 2">
              <h6 class="mb-3">Ponto de referência e instruções de entrega</h6>

              <textarea v-model="form.reference" class="form-control"></textarea>

              <div class="form-check mt-3">
                <input type="checkbox" v-model="form.primary" class="form-check-input">
                <label class="form-check-label">
                  Definir como endereço principal
                </label>
              </div>

              <div class="d-flex justify-content-between mt-4">
                <button class="btn bg-light" @click="prevStep">Voltar</button>
                <button class="btn bg-yellow fw-medium" @click="saveAddress" :disabled="isSaving">
                  {{ isSaving ? 'Salvando...' : 'Salvar Endereço' }}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>
  <IdentifyModal v-model="showIdentifyModal" />
</template>

<script setup>
    import { onBeforeUnmount, ref, watch } from 'vue'
    import { useToast } from 'vue-toastification'
    import { createAddress as createAddressRequest, deleteAddress as deleteAddressRequest, getAddresses, updateAddress as updateAddressRequest } from '@/services/api'
    import { useUserStore } from '@/stores/useUserStore'
    import IdentifyModal from './IdentifyModal.vue'

    const toast = useToast()
    const userStore = useUserStore()

    const props = defineProps({
        modelValue: Boolean
    })

    const emit = defineEmits(['update:modelValue', 'address-selected'])

    const view = ref('list')         // 'list' ou 'form'
    const step = ref(1)              // passo do formulário
    const selectedId = ref(null)     // id do endereço selecionado
    const loadingCEP = ref(false)    // flag de loading CEP
    const isLoadingAddresses = ref(false)
    const isSaving = ref(false)
    const loadError = ref('')
    const showIdentifyModal = ref(false)
    const brazilStates = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
        'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
        'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
    ]

    let debounceTimer = null

    const notifyAddressUpdate = () => {
        window.dispatchEvent(new CustomEvent('addresses-updated'))
        localStorage.setItem('addressesUpdated', Date.now().toString())
    }

    const addresses = ref([])

    const createEmptyForm = () => ({
        cep: '',
        nickname: '',
        recipientName: userStore.fullName,
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        reference: '',
        primary: false,
        id: null
    })

    const form = ref(createEmptyForm())

    const getErrorMessage = (error, fallback) => {
        const validationErrors = error.response?.data?.errors
        const firstValidationError = validationErrors
            ? Object.values(validationErrors).flat()[0]
            : null

        return firstValidationError
            || error.response?.data?.message
            || (error.response?.status ? `${fallback} (HTTP ${error.response.status})` : error.message)
            || fallback
    }

    const loadAddresses = async ({ showFormWhenEmpty = true } = {}) => {
        if (!userStore.isLogged) return []

        isLoadingAddresses.value = true
        loadError.value = ''
        localStorage.removeItem('addresses')
        localStorage.removeItem('selectedAddress')

        try {
            const loadedAddresses = await getAddresses()
            addresses.value = loadedAddresses
            selectedId.value = localStorage.getItem('selectedAddressId')

            if (showFormWhenEmpty && loadedAddresses.length === 0) {
                showForm()
            }

            return loadedAddresses
        } catch (error) {
            console.error('Não foi possível carregar os endereços da API.', error)
            loadError.value = getErrorMessage(error, 'Não foi possível carregar os endereços.')
            addresses.value = []
            return null
        } finally {
            isLoadingAddresses.value = false
        }
    }

    /* 🔥 MÁSCARA + TRIGGER AUTOMÁTICO */
    const handleCepInput = () => {
        let v = form.value.cep.replace(/\D/g, '')

        if (v.length > 5) {
            v = v.slice(0,5) + '-' + v.slice(5,8)
        }

        form.value.cep = v

        const cepLimpo = v.replace(/\D/g, '')

        if (cepLimpo.length === 8) {
            clearTimeout(debounceTimer)
            debounceTimer = setTimeout(() => {
                searchCEP(cepLimpo)
            }, 400)
        }
    }

    /* 🔥 AJAX VIA CEP */
    const searchCEP = async (cep) => {
        loadingCEP.value = true

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const data = await res.json()

            if (!data.erro) {
                form.value.street = data.logradouro
                form.value.neighborhood = data.bairro
                form.value.city = data.localidade
                form.value.state = data.uf
            }
        } catch (e) {
            console.error(e)
        }

        loadingCEP.value = false
    }

    /* ---- NAVIGATION ---- */
    const showForm = () => {
        view.value = 'form'
        step.value = 1
        form.value = createEmptyForm()
    }

    const showList = () => {
        view.value = 'list'
    }
    
    const nextStep = () => step.value = 2
    const prevStep = () => step.value = 1

    /* ---- ENDEREÇOS ---- */
    const setSelectedAddress = (address, shouldNotify = true) => {
        selectedId.value = address.id
        localStorage.setItem('selectedAddressId', String(address.id))
        emit('address-selected', address)
        if (shouldNotify) notifyAddressUpdate()
    }

    const selectAddress = (id) => {
        const selectedAddr = addresses.value.find((address) => String(address.id) === String(id))
        if (!selectedAddr) return

        setSelectedAddress(selectedAddr)
        close()
    }

    const editAddress = (id) => {
        const addr = addresses.value.find((address) => String(address.id) === String(id))
        if (addr) {
            form.value = { ...createEmptyForm(), ...addr }
            view.value = 'form'
            step.value = 1
        }
    }

    const deleteAddress = async (id) => {
        if (!confirm('Deseja excluir este endereço?')) return

        const wasSelected = localStorage.getItem('selectedAddressId') === String(id)
        isSaving.value = true

        try {
            await deleteAddressRequest(id)
            const updatedAddresses = await loadAddresses({ showFormWhenEmpty: false })
            if (!updatedAddresses) return

            if (wasSelected) {
                const nextAddress = updatedAddresses.find((address) => address.primary)
                    || updatedAddresses[0]

                if (nextAddress) {
                    setSelectedAddress(nextAddress)
                } else {
                    selectedId.value = null
                    localStorage.removeItem('selectedAddressId')
                    emit('address-selected', null)
                    notifyAddressUpdate()
                }
            } else {
                notifyAddressUpdate()
            }

            toast.success('Endereço removido com sucesso!', { timeout: 3000 })
        } catch (error) {
            console.error('Não foi possível remover o endereço.', error)
            toast.error(getErrorMessage(error, 'Não foi possível remover o endereço.'))
        } finally {
            isSaving.value = false
        }
    }

    const saveAddress = async () => {
        const isNewAddress = !form.value.id
        const wasSelected = localStorage.getItem('selectedAddressId') === String(form.value.id)
        const shouldSelect = Boolean(form.value.primary)
            || wasSelected
            || (isNewAddress && addresses.value.length === 0)
        const payload = {
            title: form.value.nickname.trim() || 'Casa',
            recipient_name: form.value.recipientName.trim(),
            zip_code: form.value.cep.trim(),
            state: form.value.state.trim(),
            city: form.value.city.trim(),
            neighborhood: form.value.neighborhood.trim(),
            street: form.value.street.trim(),
            number: form.value.number.trim(),
            complement: form.value.complement.trim() || null,
            reference: form.value.reference.trim() || null,
            is_default: Boolean(form.value.primary),
        }
        isSaving.value = true

        try {
            const response = isNewAddress
                ? await createAddressRequest(payload)
                : await updateAddressRequest(form.value.id, payload)

            const updatedAddresses = await loadAddresses({ showFormWhenEmpty: false })
            if (!updatedAddresses) {
                view.value = 'list'
                toast.warning('Endereço salvo, mas não foi possível atualizar a lista. Tente novamente.')
                return
            }

            if (shouldSelect) {
                const responseData = response.data?.data?.address
                    || response.data?.data?.data
                    || response.data?.data
                const savedId = responseData?.id || form.value.id
                const savedAddress = updatedAddresses.find(
                    (address) => String(address.id) === String(savedId),
                )
                const fallbackAddress = form.value.primary
                    ? updatedAddresses.find((address) => address.primary)
                    : isNewAddress && updatedAddresses.length === 1
                        ? updatedAddresses[0]
                        : null
                const selectedAddress = savedAddress || fallbackAddress

                if (selectedAddress) setSelectedAddress(selectedAddress, false)
            }

            notifyAddressUpdate()
            showList()
            toast.success(
                isNewAddress ? 'Endereço cadastrado com sucesso!' : 'Endereço atualizado com sucesso!',
                { timeout: 3000 },
            )
        } catch (error) {
            console.error('Não foi possível salvar o endereço.', error)
            toast.error(getErrorMessage(error, 'Não foi possível salvar o endereço.'))
        } finally {
            isSaving.value = false
        }
    }

    const close = () => {
        emit('update:modelValue', false)
    }

    watch(() => props.modelValue, async (isOpen) => {
        if (!isOpen) {
            showIdentifyModal.value = false
            return
        }

        if (!userStore.isLogged) {
            showIdentifyModal.value = true
            return
        }

        view.value = 'list'
        await loadAddresses()
    }, { immediate: true })

    watch(() => userStore.isLogged, async (isLogged) => {
        if (!isLogged) {
            addresses.value = []
            return
        }

        if (props.modelValue) {
            showIdentifyModal.value = false
            view.value = 'list'
            await loadAddresses()
        }
    })

    watch(showIdentifyModal, (isOpen, wasOpen) => {
        if (!isOpen && wasOpen && props.modelValue && !userStore.isLogged) {
            close()
        }
    })

    onBeforeUnmount(() => clearTimeout(debounceTimer))
</script>


<style scoped>
    .badge.text-black{
        font-weight: 600;
        font-size: 0.75rem;
    }
    .bg-primary{
      background: var(--primary)!important;
    }
     .bg-secondary, .progress-bar{
        background: var(--bg-yellow) !important;
    }
    .modal-title{
        font-size: clamp(1rem, 1.125vw, 1.125rem);
    }
    h6, .form-label, .form-check-label{
        font-size: clamp(0.938rem, 1vw, 1rem);
    }
    .modal-header{
        background: var(--bg-ouro);
    }
    .address-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    .address-card:hover {
        transform: translateY(-2px);
    }
    .address-card.selected {
        border-color: var(--primary);
        background-color: rgba(13,110,253,.05);
    }
    @media (max-width: 476px) {
      .address-title, .btn.btn-outline-primary.btn-sm{
        font-size: 0.844rem;  
      }
    }
</style>