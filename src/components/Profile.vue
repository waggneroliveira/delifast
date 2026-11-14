<template>
  <div
    v-if="modelValue && isAuthenticated"
    class="modal fade show modal-overlay"
    tabindex="-1"
    style="display: block;"
    @click.self="close"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">

        <!-- HEADER -->
        <div class="modal-header py-2">
          <h5 class="modal-title">
            <i class="bi bi-person-circle me-2"></i>Meu Perfil
          </h5>
          <button type="button" class="btn-close" @click="close" :disabled="isSaving || isDeleting"></button>
        </div>

        <div class="modal-body">
          <div v-if="isLoading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="text-muted mt-2 mb-0">Carregando perfil...</p>
          </div>
          <template v-else>

            <input
              type="file"
              ref="avatarInput"
              style="display: none"
              accept="image/*"
              @change="handleImageUpload"
            >

            <div v-if="view === 'view'" class="profile-view">
              <div class="text-center mb-4">
                <div class="avatar-container mb-3">
                  <img
                    v-if="profile.path_image"
                    :src="resolveApiAssetUrl(profile.path_image)"
                    class="avatar-img"
                    alt="Foto do perfil"
                  >
                  <div v-else class="avatar-placeholder">
                    <i class="bi bi-person-fill"></i>
                  </div>
                </div>
                <h5 class="mb-1">{{ profile.name || 'Usuário' }}</h5>
                <p class="text-muted small">Edite seu perfil para alterar a foto</p>
              </div>

              <div class="profile-info row g-3">
                  <div class="col-12 col-lg-7">
                      <div class="info-card h-100">
                          <div class="info-label">
                              <i class="bi bi-person"></i>
                              <span>Nome</span>
                          </div>
                          <div class="info-value">{{ profile.name || 'Não informado' }}</div>
                      </div>
                  </div>

                  <div class="col-12 col-lg-5">
                      <div class="info-card h-100">
                          <div class="info-label">
                              <i class="bi bi-telephone"></i>
                              <span>Telefone</span>
                          </div>
                          <div class="info-value">{{ formatPhone(profile.phone) || 'Não informado' }}</div>
                      </div>
                  </div>

                  <div class="col-12">
                      <div class="info-card h-100">
                          <div class="info-label">
                              <i class="bi bi-envelope"></i>
                              <span>E-mail</span>
                          </div>
                          <div class="info-value">{{ profile.email || 'Não informado' }}</div>
                      </div>
                  </div>
              </div>

              <div class="action-buttons mt-4 d-flex justify-content-end align-items-center">
                <button
                  class="btn btn-outline-danger me-auto"
                  @click="showDeleteConfirmation = true"
                  :disabled="isDeleting"
                >
                  <i class="bi bi-trash me-2"></i>Excluir conta
                </button>
                <button class="btn btn-outline-secondary me-2 d-none" @click="close" :disabled="isDeleting">
                  <i class="bi bi-x-circle me-2"></i>Fechar
                </button>
                <button class="btn btn-primary" @click="editProfile" :disabled="isDeleting">
                  <i class="bi bi-pencil-square me-2"></i>Editar Perfil
                </button>
              </div>

              <div v-if="showDeleteConfirmation" class="alert alert-danger mt-3 mb-0" role="alert">
                <strong>Excluir sua conta?</strong>
                <p class="mb-3">Essa ação é permanente e não poderá ser desfeita.</p>
                <div class="d-flex justify-content-end gap-2">
                  <button
                    class="btn btn-outline-secondary"
                    @click="showDeleteConfirmation = false"
                    :disabled="isDeleting"
                  >
                    Manter conta
                  </button>
                  <button class="btn btn-danger" @click="deleteAccount" :disabled="isDeleting">
                    {{ isDeleting ? 'Excluindo...' : 'Excluir definitivamente' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-else>
              <h6 class="mb-3">Editar Perfil</h6>

              <div class="row g-3">
                <div class="col-12 text-center mb-3">
                  <div class="avatar-container-edit mb-2" @click="triggerImageUpload">
                    <img
                      v-if="imagePreview || form.path_image"
                      :src="imagePreview || resolveApiAssetUrl(form.path_image)"
                      class="avatar-img-edit"
                      alt="Foto do perfil"
                    >
                    <div v-else class="avatar-placeholder-edit">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="avatar-edit-overlay-edit">
                      <i class="bi bi-camera-fill"></i>
                    </div>
                  </div>
                  <div>
                    <small class="text-muted">Clique para selecionar uma foto (máximo 2 MB)</small>
                  </div>
                  <button
                    v-if="imagePreview || form.path_image"
                    type="button"
                    class="btn btn-link btn-sm text-danger"
                    @click="removeImage"
                  >
                    Remover foto
                  </button>
                </div>

                <div class="col-12 col-md-7">
                  <label class="form-label">
                    Nome <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    class="form-control"
                    placeholder="Digite seu nome"
                    :class="{ 'is-invalid': errors.name }"
                  >
                  <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
                </div>

                <div class="col-12 col-md-5">
                  <label class="form-label">
                    Telefone <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.phone"
                    class="form-control"
                    placeholder="(00) 00000-0000"
                    maxlength="16"
                    @input="handlePhoneInput"
                    :class="{ 'is-invalid': errors.phone }"
                  >
                  <div class="invalid-feedback" v-if="errors.phone">{{ errors.phone }}</div>
                </div>

                <div class="col-12">
                  <label class="form-label">E-mail <small>(opcional)</small></label>
                  <input
                    v-model="form.email"
                    class="form-control"
                    type="email"
                    placeholder="seu@email.com"
                    :class="{ 'is-invalid': errors.email }"
                  >
                  <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
                </div>
              </div>

              <div class="d-flex justify-content-end align-items-center mt-4">
                <button class="btn btn-secondary" @click="cancelEdit" :disabled="isSaving">
                  Cancelar
                </button>
                <button class="btn btn-primary ms-2" @click="saveProfile" :disabled="isSaving">
                  {{ isSaving ? 'Salvando...' : 'Salvar Perfil' }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/useUserStore'
import { clearClientToken, clientApi, getClientToken, resolveApiAssetUrl } from '@/services/api'

const toast = useToast()
const userStore = useUserStore()

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'profile-updated', 'account-deleted'])

const isAuthenticated = computed(() => userStore.isLogged && Boolean(getClientToken()))
const view = ref('view')
const avatarInput = ref(null)
const errors = ref({})
const profile = ref({ id: null, name: '', phone: '', email: '', path_image: null })
const form = ref({ ...profile.value })
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const showDeleteConfirmation = ref(false)
const selectedImage = ref(null)
const imagePreview = ref('')
const deleteImage = ref(false)

const setProfile = (client) => {
  if (!client || typeof client !== 'object' || !client.id) {
    throw new Error('A resposta do perfil não contém os dados do cliente.')
  }

  profile.value = {
    id: client.id,
    name: client.name || '',
    phone: client.phone || '',
    email: client.email || '',
    path_image: client.path_image || null,
  }
  userStore.updateUser({
    id: client.id,
    fullName: profile.value.name,
    whatsapp: profile.value.phone,
    email: profile.value.email,
    pathImage: profile.value.path_image,
  })
}

const resetImageChanges = () => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = ''
  selectedImage.value = null
  deleteImage.value = false
}

const loadProfile = async () => {
  const response = await clientApi.me.get()
  setProfile(response.data?.data)
  form.value = { ...profile.value }
}

const handlePhoneInput = () => {
  form.value.phone = formatPhone(form.value.phone)
}

const formatPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const triggerImageUpload = () => {
  avatarInput.value?.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Selecione um arquivo de imagem válido.')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.error('A imagem deve ter no máximo 2 MB.')
    return
  }

  resetImageChanges()
  selectedImage.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const removeImage = () => {
  resetImageChanges()
  deleteImage.value = true
  form.value.path_image = null
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.name || form.value.name.trim().length < 3) {
    errors.value.name = 'Informe um nome com pelo menos 3 caracteres.'
  }

  const phoneDigits = form.value.phone.replace(/\D/g, '')
  if (phoneDigits.length !== 11) {
    errors.value.phone = 'Telefone deve ter 11 dígitos (DDD + número).'
  }

  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'E-mail inválido.'
  }
  return Object.keys(errors.value).length === 0
}

const editProfile = async () => {
  resetImageChanges()
  form.value = { ...profile.value }
  view.value = 'edit'
  await nextTick()
}

const cancelEdit = async () => {
  resetImageChanges()
  form.value = { ...profile.value }
  view.value = 'view'
  await nextTick()
}

const getErrorMessage = (error, fallback = 'Não foi possível atualizar o perfil.') => {
  const validationErrors = error.response?.data?.errors
  const firstValidationError = validationErrors
    ? Object.values(validationErrors).flat()[0]
    : null
  return firstValidationError || error.response?.data?.message || error.message || fallback
}

const handleUnauthorized = async () => {
  await userStore.logout()
  emit('update:modelValue', false)
  toast.warning('Sua sessão expirou. Faça login novamente.')
}

const saveProfile = async () => {
  if (!validateForm()) {
    toast.error('Por favor, corrija os erros no formulário', { timeout: 3000 })
    return
  }

  const payload = new FormData()
  payload.append('name', form.value.name.trim())
  payload.append('phone', form.value.phone.replace(/\D/g, ''))
  payload.append('email', form.value.email.trim())
  if (selectedImage.value) payload.append('path_image', selectedImage.value)
  if (deleteImage.value) payload.append('delete_path_image', '1')

  isSaving.value = true
  try {
    const response = await clientApi.me.patch(payload)
    const updatedClient = response.data?.data
    setProfile(updatedClient)
    resetImageChanges()
    form.value = { ...profile.value }
    view.value = 'view'
    emit('profile-updated', updatedClient)
  } catch (error) {
    if (error.response?.status === 401) {
      await handleUnauthorized()
      return
    }
    const validationErrors = error.response?.data?.errors || {}
    errors.value = Object.fromEntries(
      Object.entries(validationErrors).map(([field, messages]) => [
        field,
        Array.isArray(messages) ? messages[0] : messages,
      ]),
    )
    toast.error(getErrorMessage(error), { timeout: 4000 })
  } finally {
    isSaving.value = false
  }
}

const deleteAccount = async () => {
  if (!showDeleteConfirmation.value || isDeleting.value) return

  isDeleting.value = true
  try {
    const response = await clientApi.me.delete()
    clearClientToken()
    await userStore.logout()
    emit('update:modelValue', false)
    emit('account-deleted', response.data)
    toast.success(response.data?.message || 'Sua conta foi excluída com sucesso.')
  } catch (error) {
    if (error.response?.status === 401) {
      await handleUnauthorized()
      return
    }
    toast.error(getErrorMessage(error, 'Não foi possível excluir sua conta.'), { timeout: 4000 })
  } finally {
    isDeleting.value = false
  }
}

const close = () => {
  if (isSaving.value || isDeleting.value) return
  emit('update:modelValue', false)
  view.value = 'view'
  showDeleteConfirmation.value = false
  resetImageChanges()
  form.value = { ...profile.value }
  errors.value = {}
}

watch(() => props.modelValue, async (newValue) => {
  if (!newValue) return

  userStore.loadUserFromStorage()
  view.value = 'view'
  errors.value = {}
  showDeleteConfirmation.value = false
  if (!userStore.isLogged || !getClientToken()) {
    emit('update:modelValue', false)
    toast.warning('Faça login para acessar seu perfil.')
    return
  }

  isLoading.value = true
  try {
    await loadProfile()
  } catch (error) {
    if (error.response?.status === 401) {
      await handleUnauthorized()
    } else {
      toast.error(getErrorMessage(error), { timeout: 4000 })
      emit('update:modelValue', false)
    }
  } finally {
    isLoading.value = false
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-title {
  font-size: clamp(1rem, 1.125vw, 1.125rem);
}

h6, .form-label, .form-check-label {
  font-size: clamp(0.938rem, 1vw, 1rem);
}

.text-danger {
  color: #dc3545;
}

/* Avatar estilos */
.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar-placeholder i {
  font-size: 60px;
}

.avatar-edit-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  text-align: center;
  padding: 8px;
  font-size: 20px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.avatar-container:hover .avatar-edit-overlay {
  transform: translateY(0);
}

/* Avatar para edição */
.avatar-container-edit {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.avatar-container-edit:hover {
  transform: scale(1.05);
}

.avatar-img-edit {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-edit {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar-placeholder-edit i {
  font-size: 50px;
}

.avatar-edit-overlay-edit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  text-align: center;
  padding: 6px;
  font-size: 16px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.avatar-container-edit:hover .avatar-edit-overlay-edit {
  transform: translateY(0);
}

/* Cards de informação */
.info-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: #f1f3f5;
  transform: translateX(5px);
}

.info-label {
  font-size: 0.85rem;
  color: var(--text-medium);
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label i {
  font-size: 1rem;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #212529;
  margin-left: 24px;
}

/* Botões */
.btn-primary {
  border-color: var(--primary) !important;
  color: #FFF !important;
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--bg-primary-hover) !important;
  border-color: var(--bg-primary-hover) !important;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--text-medium) !important;
  border-color: var(--text-medium) !important;
}

.btn-secondary:hover {
  background: #5a6268 !important;
  transform: translateY(-1px);
}

.btn-outline-secondary {
  color: var(--text-medium) !important;
  border-color: var(--text-medium) !important;
}

.btn-outline-secondary:hover {
  background: var(--text-medium) !important;
  color: #fff !important;
  transform: translateY(-1px);
}

/* Animações */
.profile-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .avatar-container {
    width: 100px;
    height: 100px;
  }
  
  .avatar-container-edit {
    width: 80px;
    height: 80px;
  }
  
  .info-value {
    font-size: 0.9rem;
  }
  
  .info-label {
    font-size: 0.75rem;
  }
}
</style>