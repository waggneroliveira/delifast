<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0,0,0,.6)"
    @click.self="close"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content p-3 rounded-4">

        <!-- HEADER -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <button class="btn btn-sm btn-outline-secondary" @click="close">
            ← Voltar
          </button>

          <button class="btn-close" @click="close"></button>
        </div>

        <div class="row">
          <!-- LEFT -->
          <div class="col-md-5">
            <img
              :src="product?.image"
              class="img-fluid rounded-4 mb-2"
            />

            <span v-if="product?.cashback" class="badge bg-warning text-dark mb-2">
              {{ product.cashback }}% cashback
            </span>

            <h5 class="fw-bold">{{ product?.name }}</h5>
            <p class="text-muted small">
              {{ product?.description }}
            </p>

            <div class="mt-2">
              <h5 class="fw-bold">
                R$ {{ formatPrice(product?.price) }}
              </h5>

              <div class="text-muted small" v-if="product?.oldPrice">
                <s>R$ {{ formatPrice(product.oldPrice) }}</s>
                <span class="badge bg-danger ms-2">
                  {{ discount }}%
                </span>
              </div>
            </div>
          </div>

          <!-- RIGHT -->
          <div class="col-md-7" v-if="product?.options?.length">
            <div
              v-for="group in product.options"
              :key="group.title"
              class="mb-4"
            >
              <h6 class="fw-bold text-primary">
                {{ group.title }}
              </h6>

              <div
                v-for="item in group.items"
                :key="item.id"
                class="d-flex align-items-center border rounded p-2 mb-2 option-item"
                :class="{ active: selected === item.id }"
                @click="select(item.id)"
              >
                <img
                  :src="item.image"
                  class="rounded me-2"
                  width="50"
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