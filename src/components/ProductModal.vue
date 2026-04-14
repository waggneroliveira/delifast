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
          <div class="my-3 d-flex justify-content-end align-items-center w-100 px-4 z-in">
            <!-- <button class="btn btn-sm btn-back text-white py-1 px-3" @click="close">
              ‹  Voltar
            </button> -->

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
          <div class="col-md-7 scroll">
            <div class="col-md-12" v-if="product?.options?.length">
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
            <div class="col-md-12" v-if="product?.aditionals?.length">
              <div
                v-for="group in product.aditionals"
                :key="group.title"
                class="mb-4"
              >
                <h6 class="fw-bold text-primary text-center mb-3">
                  {{ group.title }}
                </h6>

                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="d-flex align-items-center justify-content-between border rounded px-3 py-2 mb-2"
                >
                  <!-- Nome -->
                  <div class="fw-medium">
                    {{ item.name }}
                  </div>

                  <!-- Counter -->
                  <div class="d-flex align-items-center gap-2">
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="decreaseAditional(item.id)"
                    >
                      -
                    </button>

                    <span class="fw-bold">
                      {{ getAditionalQty(item.id) }}
                    </span>

                    <button
                      class="btn btn-sm btn-outline-success"
                      @click="increaseAditional(item)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 d-flex">

            <button 
              class="btn btn-sm btn-primary font-15"
              :disabled="!canSubmit"
              @click="addToCart"
            >

              <span class="me-2 bi bi-pencil-square"></span> 
              {{ isEditing ? 'Editar' : 'Adicionar' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useCartStore } from '@/stores/useCartStore'

  const cart = useCartStore()

  const props = defineProps({
    show: Boolean,
    product: Object
  })

  const emit = defineEmits(['update:show'])

  const selected = ref(null)
  const originalSelected = ref(null)
  const aditionalState = ref({})

  // Reset ao abrir o modal
  watch(
    () => props.product,
    (newProduct) => {
      if (!newProduct) return

      selected.value = newProduct.selectedOption || null
      originalSelected.value = newProduct.selectedOption || null

      // Inicializa os adicionais
      const state = {}
      if (newProduct.aditionals) {
        newProduct.aditionals.forEach(group => {
          group.items.forEach(item => {
            state[item.id] = item.quantity || 0
          })
        })
      }
      aditionalState.value = state
    },
    { immediate: true }
  )

  const isEditing = computed(() => originalSelected.value !== null)
  const hasChanged = computed(() => selected.value !== originalSelected.value)

  const canSubmit = computed(() => {
    if (!props.product?.options?.length) return true
    if (!isEditing.value) return !!selected.value
    return hasChanged.value
  })

  function addToCart() {
    if (!props.product) return

    // 🔥 ATUALIZA AS QUANTIDADES DOS ADICIONAIS
    const updatedAditionals = (props.product.aditionals || []).map(group => ({
      title: group.title,
      items: group.items.map(item => ({
        ...item,
        quantity: aditionalState.value[item.id] || 0
      }))
    }))

    const productToAdd = {
      ...props.product,
      selectedOption: selected.value,
      originalSelectedOption: originalSelected.value,
      aditionals: updatedAditionals
    }

    if (isEditing.value) {
      cart.updateItem(productToAdd)
    } else {
      cart.add(productToAdd)
    }

    close()
  }

  const select = (id) => { selected.value = id }
  
  const close = () => {
    selected.value = null
    originalSelected.value = null
    aditionalState.value = {}
    emit('update:show', false)
  }

  const formatPrice = (value) => {
    if (!value) return '0,00'
    return value.toFixed(2).replace('.', ',')
  }

  const discount = computed(() => {
    if (!props.product?.oldPrice) return 0
    return Math.round(100 - (props.product.price / props.product.oldPrice) * 100)
  })

  const getAditionalQty = (id) => aditionalState.value[id] || 0
  
  const increaseAditional = (item) => {
    const current = aditionalState.value[item.id] || 0
    if (current >= item.stock) return
    aditionalState.value[item.id] = current + 1
  }
  
  const decreaseAditional = (id) => {
    const current = aditionalState.value[id] || 0
    if (current <= 0) return
    aditionalState.value[id] = current - 1
  }
</script>


<style scoped>
::v-deep(.banner-inner) {
  height: 140px;
}
.font-15{
  font-size: 0.938rem;
}
.scroll{
  height: 450px;
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