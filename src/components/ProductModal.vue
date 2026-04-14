<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0,0,0,.6)"
    @click.self="close"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content p-0 rounded-0 h-100">

        <!-- HEADER -->
        <div class="d-flex justify-content-between align-items-center mb-3 position-relative">
          <div class="my-4 d-flex justify-content-between align-items-center w-100 px-4 z-in">
            <button class="btn btn-sm btn-back text-white py-1 px-3" @click="close">
              ‹  Voltar
            </button>

            <button class="btn-close" @click="close"></button>
          </div>
        </div>

        <div class="row pb-5 px-4">
          <!-- LEFT -->
          <div class="col-md-5 text-center">
            <div class="image">
              <img
                :src="product?.image"
                class="img-fluid w-100 rounded-4 mb-2"
              />
            </div>

            <span v-if="product?.cashback" class="badge bg-warning text-dark mb-2">
              {{ product.cashback }}% cashback
            </span>

            <h5 class="fw-bold text-primary">{{ product?.name }}</h5>
            <p class="text-muted small">
              {{ product?.description }}
            </p>

            <div class="mt-2">
              <h5 class="fw-bold">
                R$ {{ formatPrice(product?.price) }}
              </h5>

              <div class="text-muted small" v-if="product?.oldPrice">
                <s>R$ {{ formatPrice(product.oldPrice) }}</s>
                <span class="badge bg-primary rounded-1 ms-2">
                  {{ discount }}%
                </span>
              </div>
            </div>
          </div>

          <!-- RIGHT -->
          <div class="col-md-7 scroll" v-if="product?.options?.length">
            <div
              v-for="group in product.options"
              :key="group.title"
              class="mb-4"
            >
              <h6 class="fw-bold text-primary text-center mb-4">
                {{ group.title }}
              </h6>

              <div
                v-for="item in group.items"
                :key="item.id"
                class="d-flex align-items-center border gap-1 rounded p-0 mb-2 option-item pe-3"
                :class="{ active: selected === item.id }"
                @click="select(item.id)"
              >
                <img
                  :src="item.image"
                  class="me-3 cover"
                  width="105"
                  height="105"
                />

                <div class="flex-grow-1">
                  <div class="fw-semibold">
                    {{ item.name }}
                  </div>
                  <small class="text-muted">
                    {{ item.description }}
                  </small>
                </div>

                <input
                  type="radio"
                  :checked="selected === item.id"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          class="btn btn-sm btn-primary"
          :disabled="!canSubmit"
          @click="addToCart"
        >
          <span class="me-2">+</span> 
          {{ isEditing ? 'Editar' : 'Adicionar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useCartStore } from '@/stores/useCartStore'

  const cart = useCartStore()

  // Props
  const props = defineProps({
    show: Boolean,
    product: Object
  })

  const emit = defineEmits(['update:show'])

  // Estados
  const selected = ref(null)
  const originalSelected = ref(null)

  // Watch para sincronizar ao abrir modal
  watch(
    () => [props.product, props.show],
    ([newProduct, isOpen]) => {
      if (!isOpen || !newProduct) return

      selected.value = newProduct.selectedOption || null
      originalSelected.value = newProduct.selectedOption || null
    },
    { immediate: true }
  )

  // Saber se está editando
  const isEditing = computed(() => {
    return originalSelected.value !== null
  })

  // Saber se houve mudança
  const hasChanged = computed(() => {
    return selected.value !== originalSelected.value
  })

  // Controle do botão
  const canSubmit = computed(() => {
    // Sem opções → sempre pode
    if (!props.product?.options?.length) return true

    // Produto novo → precisa selecionar
    if (!isEditing.value) {
      return !!selected.value
    }

    // Produto em edição → só se mudou
    return hasChanged.value
  })

  // Ação principal
  function addToCart() {
    if (!props.product) return

    const productToAdd = {
      ...props.product,
      selectedOption: selected.value
    }

    // Se estiver editando, remove o antigo antes
    if (isEditing.value) {
      cart.remove(props.product.id)
    }

    cart.add(productToAdd)
    close()
  }

  // Seleção de opção
  const select = (id) => {
    selected.value = id
  }

  // Fechar modal
  const close = () => {
    selected.value = null
    originalSelected.value = null
    emit('update:show', false)
  }

  // Utils
  const formatPrice = (value) => {
    if (!value) return '0,00'
    return value.toFixed(2).replace('.', ',')
  }

  const discount = computed(() => {
    if (!props.product?.oldPrice) return 0
    return Math.round(100 - (props.product.price / props.product.oldPrice) * 100)
  })
</script>

<style scoped>
::v-deep(.banner-inner) {
  height: 140px;
}
.scroll{
  height: 550px;
  overflow-y: scroll;
}
.text-primary{
  color: #A4268E !important;
}
.bg-primary{
  background: #A4268E !important;
}
.image{
  max-width: 380px;
}
.btn-back{
  background: #A4268E !important;
  all: unset;
  cursor: pointer;
}
.z-in{
  z-index: 20;
}
.modal-dialog{
    max-width: 980px;
    height: auto;
    max-height: 500px;
}
.cover{
  object-fit: cover;
}
.option-item {
  cursor: pointer;
  transition: .2s;
}

.option-item:hover {
  border-color: #a020f0;
}

.option-item.active {
  border-color: #a020f0;
  background: #f8f0ff;
}
</style>