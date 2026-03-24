<template>
  <div class="card product-card h-100">
    <div class="position-relative">
      <span class="badge cashback position-absolute top-0 start-0 m-2 small">
        {{ product.cashback }}% cashback
      </span>

      <img :src="product.image" class="card-img-top" />
    </div>

    <div class="card-body d-flex flex-column">
      <h6 class="mb-1">{{ product.name }}</h6>

      <p class="text-muted small mb-2">
        {{ product.description }}
      </p>

      <div class="mt-auto d-flex justify-content-between align-items-center">
        <div>
          <strong class="text-dark">R$ {{ product.price }}</strong>
          <div class="text-muted small text-decoration-line-through" v-if="product.oldPrice">
            R$ {{ product.oldPrice }}
          </div>
        </div>

        <button class="btn btn-sm btn-primary" @click="$emit('add', product)">
          Adicionar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    product: Object
  })
</script>

<style scoped>
  .cashback{
    background: #D9FFE6;
    color: #2F2B2B;
    font-size: clamp(0.75rem, 0.875vw, 0.875rem);
  }
  .product-card img {
    height: 140px;
    object-fit: cover;
  }
</style>