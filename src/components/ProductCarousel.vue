<template>
  <div class="mb-4">
    <h5 class="mb-3">Destaques</h5>

    <div class="d-flex gap-3 overflow-auto pb-2">
      <div
        v-for="product in products"
        :key="product.id"
        style="min-width: 220px;"
      >
        <ProductCard :product="product" @add="$emit('add', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: Array
})
</script>