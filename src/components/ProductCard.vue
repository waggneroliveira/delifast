<template>
  <div class="card product-card h-100 cursor-pointer">
    <div class="position-relative">
      <span class="badge cashback position-absolute top-0 start-0 m-2 small">
        {{ product.cashback }}% cashback
      </span>

      <img :src="product.image" class="card-img-top" @click="$emit('open', product)"/>
    </div>

    <div class="card-body d-flex flex-column">
      <h6 class="mb-1">{{ product.name }}</h6>

      <p class="text-muted small mb-2">
        {{ product.description }}
      </p>

      <div class="mt-auto d-flex justify-content-between align-items-center">
        <div class="info-price">
          <strong class="text-dark price">R$ {{ product.price }}</strong>
          <div class="d-flex gap-1">
            <div class="text-muted small text-decoration-line-through" v-if="product.oldPrice">
              R$ {{ product.oldPrice }}
            </div>
            <div class="percent rounded-1 text-white d-flex justify-content-center align-items-center px-1">
              {{ Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) }}%
            </div>
          </div>
        </div>
        <!-- 
          Adicionar no button p click ao carrinho
          @click.stop="$emit('add', product)"
         -->
        <button class="btn btn-sm btn-primary" @click="$emit('open', product)">
          <span class="me-2">+</span> Adicionar
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
  .product-card {
    cursor: pointer;
  }
  .price{
    font-size: clamp(0.75rem, 1.25vw, 1rem);
  }
  .cashback{
    background: #D9FFE6;
    color: #2F2B2B;
    font-size: clamp(0.75rem, 0.875vw, 0.875rem);
  }
  .product-card img {
    height: 250px;
    object-fit: cover;
  }
  .percent{
    background: #A4268E;
    font-size: 0.75rem;
    font-weight: 600;
  }
  h6{
    font-size: clamp(0.75rem, 1.25vw, 1rem);
  }
</style>