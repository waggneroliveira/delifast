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
                :src="product?.images?.[0] || product?.image"
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
                R$ {{ formatPrice(finalPrice) }}
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
            <!-- Opções (Sabores/Tamanhos) baseado na nova estrutura -->
            <div class="col-md-12" v-if="hasOptions">
              <div
                v-for="group in optionGroups"
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
                  :class="{ active: isOptionSelected(item) }"
                  @click="selectOption(item)"
                >
                  <img
                    :src="item.image || product?.images?.[0]"
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
                    <div v-if="item.price > 0" class="text-primary small fw-bold">
                      + R$ {{ formatPrice(item.price) }}
                    </div>
                  </div>

                  <input
                    type="radio"
                    :checked="isOptionSelected(item)"
                  />
                </div>
              </div>
            </div>

            <!-- Opção de Tamanhos (estrutura alternativa) -->
            <div class="col-md-12" v-if="hasSizes">
              <div class="mb-4">
                <h6 class="fw-bold text-primary text-center mb-4">
                  Tamanhos
                </h6>

                <div
                  v-for="size in product?.customization?.sizes"
                  :key="size.id"
                  class="d-flex align-items-center border gap-1 rounded p-0 mb-2 option-item pe-3"
                  :class="{ active: selectedSize?.id === size.id }"
                  @click="selectedSize = size"
                >
                  <div class="flex-grow-1 p-3">
                    <div class="fw-semibold">
                      {{ size.name }}
                    </div>
                    <small class="text-muted" v-if="size.description">
                      {{ size.description }}
                    </small>
                    <div class="text-primary fw-bold">
                      R$ {{ formatPrice(size.price) }}
                      <span v-if="size.oldPrice" class="text-muted small ms-2">
                        <s>R$ {{ formatPrice(size.oldPrice) }}</s>
                      </span>
                    </div>
                  </div>

                  <input
                    type="radio"
                    :checked="selectedSize?.id === size.id"
                    class="me-3"
                  />
                </div>
              </div>
            </div>

            <!-- Sabores (para pizzas) -->
            <div class="col-md-12" v-if="hasFlavors">
              <div class="mb-4">
                <h6 class="fw-bold text-primary text-center mb-4">
                  Sabores (máx. {{ maxFlavors }})
                </h6>

                <div
                  v-for="flavor in product?.customization?.flavors"
                  :key="flavor.id"
                  class="d-flex align-items-center border gap-1 rounded p-0 mb-2 option-item pe-3"
                  :class="{ active: isFlavorSelected(flavor) }"
                  @click="toggleFlavor(flavor)"
                >
                  <div class="flex-grow-1 p-3">
                    <div class="fw-semibold">
                      {{ flavor.name }}
                      <span v-if="flavor.isRecommended" class="badge bg-primary ms-2">
                        Recomendado
                      </span>
                    </div>
                    <small class="text-muted">
                      {{ flavor.description }}
                    </small>
                    <div v-if="flavor.price > 0" class="text-primary small fw-bold">
                      + R$ {{ formatPrice(flavor.price) }}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    :checked="isFlavorSelected(flavor)"
                    :disabled="maxFlavorsReached && !isFlavorSelected(flavor)"
                    class="me-3"
                  />
                </div>
              </div>
            </div>
            
            <!-- Adicionais (Toppings) -->
            <div class="col-md-12" v-if="hasAditionals">
              <div
                v-for="group in aditionalGroups"
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

  // Estados para personalizações
  const selectedOption = ref(null)
  const selectedSize = ref(null)
  const selectedFlavors = ref([])
  const aditionalState = ref({})
  
  // Estados originais para edição
  const originalSelectedOption = ref(null)
  const originalSelectedSize = ref(null)
  const originalSelectedFlavors = ref([])
  const originalAditionalsState = ref({})

  // Computed properties para verificar disponibilidade
  const hasOptions = computed(() => {
    return props.product?.options?.length > 0
  })

  const hasSizes = computed(() => {
    return props.product?.customization?.hasSize && props.product?.customization?.sizes?.length > 0
  })

  const hasFlavors = computed(() => {
    return props.product?.customization?.hasFlavors && props.product?.customization?.flavors?.length > 0
  })

  const hasAditionals = computed(() => {
    return (props.product?.aditionals?.length > 0) || 
           (props.product?.customization?.hasToppings && props.product?.customization?.toppings?.length > 0)
  })

  const maxFlavors = computed(() => {
    return props.product?.customization?.maxFlavors || 
           (props.product?.cuisineType === 'pizza' ? 2 : 
           (props.product?.cuisineType === 'acai' ? 3 : 0))
  })

  const maxFlavorsReached = computed(() => {
    return selectedFlavors.value.length >= maxFlavors.value
  })

  // Agrupa adicionais (prioriza a nova estrutura)
  const aditionalGroups = computed(() => {
    if (props.product?.aditionals?.length > 0) {
      return props.product.aditionals
    }
    
    if (props.product?.customization?.hasToppings && props.product?.customization?.toppings?.length > 0) {
      return [{
        title: 'Adicionais',
        items: props.product.customization.toppings
      }]
    }
    
    return []
  })

  // Agrupa opções (backward compatibility)
  const optionGroups = computed(() => {
    if (props.product?.options?.length > 0) {
      return props.product.options
    }
    return []
  })

  // Preço final calculado
  const finalPrice = computed(() => {
    let price = props.product?.price || 0
    
    // Se tem tamanho selecionado
    if (selectedSize.value) {
      price = selectedSize.value.price
    }
    
    // Adiciona preço dos sabores selecionados
    selectedFlavors.value.forEach(flavor => {
      price += flavor.price || 0
    })
    
    // Adiciona preço dos adicionais
    Object.entries(aditionalState.value).forEach(([id, quantity]) => {
      const item = findAditionalById(parseInt(id))
      if (item && item.price) {
        price += item.price * quantity
      }
    })
    
    return price
  })

  // Verifica se está editando
  const isEditing = computed(() => {
      // Se veio com flag explícita
      if (props.product?.isEditing) return true
      
      // Se tem qualquer opção original
      if (props.product?.originalSelectedOption !== null && 
          props.product?.originalSelectedOption !== undefined) return true
      
      // Se tem tamanho original
      if (props.product?.originalSelectedSize !== null && 
          props.product?.originalSelectedSize !== undefined) return true
      
      // Se tem sabores originais
      if (props.product?.originalSelectedFlavors && 
          props.product.originalSelectedFlavors.length > 0) return true
      
      return false
  })
    
  // Verifica se houve mudanças
  const hasOptionsChanged = computed(() => {
    return selectedOption.value !== originalSelectedOption.value
  })
  
  const hasSizeChanged = computed(() => {
    return selectedSize.value?.id !== originalSelectedSize.value?.id
  })
  
  const hasFlavorsChanged = computed(() => {
    if (selectedFlavors.value.length !== originalSelectedFlavors.value.length) return true
    return selectedFlavors.value.some(f => !originalSelectedFlavors.value.find(of => of.id === f.id))
  })
  
  const hasAditionalsChanged = computed(() => {
    for (const [id, quantity] of Object.entries(aditionalState.value)) {
      if (quantity !== (originalAditionalsState.value[id] || 0)) {
        return true
      }
    }
    return false
  })
  
  // Botão habilitado
  const canSubmit = computed(() => {
    // Se é edição, sempre pode clicar (mesmo sem mudanças, mantém o original)
    if (isEditing.value) return true
    
    // Para novo item, precisa ter seleção
    if (hasOptions.value && !selectedOption.value) return false
    if (hasSizes.value && !selectedSize.value) return false
    if (hasFlavors.value && selectedFlavors.value.length === 0) return false
    
    return true
  })

  const discount = computed(() => {
    if (!props.product?.oldPrice) return 0
    return Math.round(100 - (props.product.price / props.product.oldPrice) * 100)
  })

  // Funções auxiliares
  const findAditionalById = (id) => {
    for (const group of aditionalGroups.value) {
      const item = group.items.find(i => i.id === id)
      if (item) return item
    }
    return null
  }

  const isOptionSelected = (item) => {
    return selectedOption.value === item.id
  }

  const isFlavorSelected = (flavor) => {
    return selectedFlavors.value.some(f => f.id === flavor.id)
  }

  const selectOption = (item) => {
    selectedOption.value = item.id
  }

  const toggleFlavor = (flavor) => {
    const index = selectedFlavors.value.findIndex(f => f.id === flavor.id)
    if (index > -1) {
      selectedFlavors.value.splice(index, 1)
    } else {
      if (!maxFlavorsReached.value) {
        selectedFlavors.value.push(flavor)
      }
    }
  }

  const getAditionalQty = (id) => aditionalState.value[id] || 0
  
  const increaseAditional = (item) => {
    const current = aditionalState.value[item.id] || 0
    const maxStock = item.stock || 99
    if (current >= maxStock) return
    aditionalState.value[item.id] = current + 1
  }
  
  const decreaseAditional = (id) => {
    const current = aditionalState.value[id] || 0
    if (current <= 0) return
    aditionalState.value[id] = current - 1
  }

  // Reset ao abrir o modal
  const resetState = () => {
    selectedOption.value = null
    selectedSize.value = null
    selectedFlavors.value = []
    aditionalState.value = {}
    
    originalSelectedOption.value = null
    originalSelectedSize.value = null
    originalSelectedFlavors.value = []
    originalAditionalsState.value = {}
  }

  // Carrega dados do produto ao abrir
  watch(
    () => props.product,
    (newProduct) => {
      if (!newProduct || !props.show) return

      resetState()

      // Carrega opção selecionada (se existir)
      if (newProduct.selectedOption) {
        selectedOption.value = newProduct.selectedOption
        originalSelectedOption.value = newProduct.selectedOption
      }

      // Carrega tamanho selecionado (se existir)
      if (newProduct.selectedSize) {
        selectedSize.value = newProduct.selectedSize
        originalSelectedSize.value = newProduct.selectedSize
      }

      // Carrega sabores selecionados (se existir)
      if (newProduct.selectedFlavors && newProduct.selectedFlavors.length) {
        selectedFlavors.value = [...newProduct.selectedFlavors]
        originalSelectedFlavors.value = [...newProduct.selectedFlavors]
      }

      // Carrega adicionais
      const state = {}
      const originalState = {}
      
      // Para estrutura antiga (aditionals)
      if (newProduct.aditionals && newProduct.aditionals.length > 0) {
        newProduct.aditionals.forEach(group => {
          group.items.forEach(item => {
            const quantity = item.quantity || 0
            state[item.id] = quantity
            originalState[item.id] = quantity
          })
        })
      }
      
      // Para estrutura nova (customization.toppings)
      if (newProduct.customization?.hasToppings && newProduct.customization?.toppings) {
        newProduct.customization.toppings.forEach(item => {
          if (state[item.id] === undefined) {
            state[item.id] = 0
            originalState[item.id] = 0
          }
        })
      }
      
      aditionalState.value = state
      originalAditionalsState.value = originalState
    },
    { immediate: true, deep: true }
  )

  function addToCart() {
    if (!props.product) return

    // Prepara os adicionais atualizados
    const updatedAditionals = aditionalGroups.value.map(group => ({
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
      price: finalPrice.value,
      originalPrice: props.product.price,
      oldPrice: props.product.oldPrice,
      image: props.product.images?.[0] || props.product.image,
      cashback: props.product.cashback || 0,
      // Dados de personalização
      selectedOption: selectedOption.value,
      selectedSize: selectedSize.value,
      selectedFlavors: selectedFlavors.value,
      originalSelectedOption: originalSelectedOption.value,
      originalSelectedSize: originalSelectedSize.value,
      originalSelectedFlavors: originalSelectedFlavors.value,
      // Adicionais
      aditionals: updatedAditionals,
      // Metadados
      customization: props.product.customization,
      cuisineType: props.product.cuisineType
    }

    if (isEditing.value) {
      cart.updateItem(productToAdd)
    } else {
      cart.add(productToAdd)
    }

    close()
  }

  const close = () => {
    resetState()
    emit('update:show', false)
  }

  const formatPrice = (value) => {
    if (!value && value !== 0) return '0,00'
    return value.toFixed(2).replace('.', ',')
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