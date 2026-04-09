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

        <div class="row px-4">
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

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: Boolean,       // mudou de modelValue → show
  product: Object
})

const emit = defineEmits(['update:show']) // mudou de update:modelValue → update:show

const selected = ref(null)

const close = () => {
  selected.value = null
  emit('update:show', false)
}

const select = (id) => {
  selected.value = id
}

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
    height: 80vh;
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