<template>
  <div class="mb-5">
    <h5 class="mb-3">{{ title }}</h5>

    <div class="d-flex gap-1">
      <div
        v-for="product in products"
        :key="product.id"
        class="col-6 col-md-4 col-lg-3 mb-3 p-0"
      >
        <ProductCard :product="product" @add="$emit('add', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import ProductCard from './ProductCard.vue'

  defineProps({
    title: String,
    products: Array
  })
</script>

<style scoped>
  ::v-deep(.product-card img) {
    height: 200px;
  }
  ::v-deep(h6) {
    font-size: clamp(0.875rem, 0.938rem, 0.938rem);
  }
</style>