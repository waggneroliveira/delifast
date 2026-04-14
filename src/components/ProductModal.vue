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
                  <div class="fw-medium">
                    {{ item.name }}
                    <small class="text-muted ms-1" v-if="item.price > 0">
                      (+R$ {{ formatPrice(item.price) }})
                    </small>
                  </div>

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
  const originalAditionalsState = ref({})

  // Reset ao abrir o modal
  watch(
    () => props.product,
    (newProduct) => {
      if (!newProduct) return

      console.log('Modal abriu com produto:', newProduct) // Debug

      // Usa as propriedades que você já está passando do Cart.vue
      selected.value = newProduct.selectedOption || null
      originalSelected.value = newProduct.originalSelectedOption || null

      // Inicializa os adicionais
      const state = {}
      const originalState = {}
      
      // Usa os adicionais que vieram do produto (já com as quantidades atuais)
      if (newProduct.aditionals && newProduct.aditionals.length > 0) {
        newProduct.aditionals.forEach(group => {
          group.items.forEach(item => {
            const quantity = item.quantity || 0
            state[item.id] = quantity
            originalState[item.id] = quantity
          })
        })
      }
      
      aditionalState.value = state
      originalAditionalsState.value = originalState
      
      console.log('Estado dos adicionais carregado:', aditionalState.value)
    },
    { immediate: true, deep: true }
  )

  const isEditing = computed(() => originalSelected.value !== null)
  
  // Verifica se as opções mudaram
  const hasOptionsChanged = computed(() => selected.value !== originalSelected.value)
  
  // Verifica se os adicionais mudaram
  const hasAditionalsChanged = computed(() => {
    for (const [id, quantity] of Object.entries(aditionalState.value)) {
      if (quantity !== (originalAditionalsState.value[id] || 0)) {
        return true
      }
    }
    return false
  })
  
  // Botão só pode ser clicado se houver mudanças (na edição) ou se tiver opção selecionada (novo)
  const canSubmit = computed(() => {
    // Se tem opções e nenhuma selecionada, não pode
    if (props.product?.options?.length && !selected.value) {
      return false
    }
    
    // Se for edição, precisa ter mudado algo (opção OU adicionais)
    if (isEditing.value) {
      return hasOptionsChanged.value || hasAditionalsChanged.value
    }
    
    // Novo item: só precisa ter opção selecionada (se houver opções)
    return true
  })

  function addToCart() {
    if (!props.product) return

    console.log('Salvando produto com adicionais:', aditionalState.value)

    // ATUALIZA AS QUANTIDADES DOS ADICIONAIS
    const updatedAditionals = (props.product.aditionals || []).map(group => ({
      title: group.title,
      items: group.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price || 0,
        stock: item.stock || 99,
        quantity: aditionalState.value[item.id] || 0
      }))
    }))

    const productToAdd = {
      id: props.product.id,
      name: props.product.name,
      description: props.product.description,
      price: props.product.price,
      oldPrice: props.product.oldPrice,
      image: props.product.image,
      cashback: props.product.cashback || 0,
      options: props.product.options || [],
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

  const select = (id) => { 
    selected.value = id 
  }
  
  const close = () => {
    selected.value = null
    originalSelected.value = null
    aditionalState.value = {}
    originalAditionalsState.value = {}
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
    if (current >= (item.stock || 99)) {
      console.warn(`Estoque máximo atingido para ${item.name}`)
      return
    }
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