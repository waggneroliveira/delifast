<template>
  <div
    v-if="modelValue"
    class="modal fade show"
    tabindex="-1"
    style="display: block; background: rgba(0, 0, 0, 0.5)"
    @click.self="close"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content identify-modal">
        <div class="modal-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-person-circle fs-4 text-secondary"></i>
            <h5 class="modal-title mb-0">{{ userStore.isLogged ? 'Minha conta' : 'Identifique-se' }}</h5>
          </div>
          <button type="button" class="btn-close" aria-label="Fechar" @click="close"></button>
        </div>

        <div class="modal-body">
          <div v-if="userStore.isLogged" class="text-center">
            <p class="mb-1">{{ userStore.fullName }}</p>
            <small class="d-block text-muted mb-3">{{ userStore.whatsapp }}</small>
            <button class="btn btn-outline-danger w-100" :disabled="isLoading" @click="logout">
              {{ isLoading ? 'Saindo...' : 'Sair da conta' }}
            </button>
          </div>

          <form v-else @submit.prevent="login">
            <div class="mb-3">
              <label for="client-phone" class="form-label">Telefone</label>
              <div class="input-group">
                <span class="input-group-text">+55</span>
                <input
                  id="client-phone"
                  v-model="phone"
                  type="tel"
                  class="form-control"
                  placeholder="(99) 99999-9999"
                  autocomplete="tel-national"
                  maxlength="15"
                  required
                  :disabled="isLoading"
                  @input="formatPhone"
                >
              </div>
            </div>

            <div class="mb-3">
              <label for="client-name" class="form-label">Nome completo</label>
              <input
                id="client-name"
                v-model="name"
                type="text"
                class="form-control"
                placeholder="Digite seu nome completo"
                autocomplete="name"
                maxlength="255"
                required
                :disabled="isLoading"
              >
            </div>

            <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
              {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
              {{ isLoading ? 'Entrando...' : 'Continuar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/useUserStore'
import { clientApi } from '@/services/api'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'submit'])
const toast = useToast()
const userStore = useUserStore()

const name = ref('')
const phone = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const close = () => {
  if (isLoading.value) return
  emit('update:modelValue', false)
}

const formatPhone = () => {
  const digits = phone.value.replace(/\D/g, '').slice(0, 11)

  if (digits.length > 6) {
    phone.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  } else if (digits.length > 2) {
    phone.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  } else if (digits.length) {
    phone.value = `(${digits}`
  }
}

const getErrorMessage = (error) => {
  const validationErrors = error.response?.data?.errors
  const firstValidationError = validationErrors
    ? Object.values(validationErrors).flat()[0]
    : null

  return firstValidationError || error.response?.data?.message || error.message || 'Não foi possível entrar.'
}

const login = async () => {
  if (userStore.isLogged) return

  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await clientApi.login({
      name: name.value.trim(),
      phone: phone.value.trim(),
    })
    const client = response.data.data.client

    userStore.login({
      id: client.id,
      fullName: client.name,
      whatsapp: client.phone,
      email: client.email || '',
      pathImage: client.path_image || '',
    })

    emit('submit', {
      id: client.id,
      fullName: client.name,
      whatsapp: client.phone,
      email: client.email || '',
      pathImage: client.path_image || '',
    })
    isLoading.value = false
    close()
  } catch (error) {
    console.error('Não foi possível autenticar o cliente.', error)
    errorMessage.value = getErrorMessage(error)
    toast.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const logout = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    await userStore.logout()
    toast.info('Você saiu da sua conta.')
    isLoading.value = false
    close()
  } finally {
    isLoading.value = false
  }
}

watch(() => props.modelValue, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  errorMessage.value = ''

  if (isOpen && userStore.isLogged) {
    name.value = userStore.fullName
    phone.value = userStore.whatsapp
  } else if (isOpen) {
    name.value = ''
    phone.value = ''
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.identify-modal {
  position: relative;
  z-index: 1060;
  border: 0;
  border-radius: 0.75rem;
}

.modal-header {
  background: var(--bg-ouro);
}
</style>
