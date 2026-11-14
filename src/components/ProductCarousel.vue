<template>
  <div class="mb-4">
    <div class="product-section-header">
      <h5 class="title-section-product">Destaques</h5>
      <div class="product-section-announcement">
        <slot name="announcement" />
      </div>
    </div>
      
    <Swiper
      :modules="[]"
      :space-between="12"
      :slides-per-view="1.2"
      :slides-per-group="1"
      navigation
      :loop="true"
      class="pb-2"
      :breakpoints="breakpoints"
    >
      <SwiperSlide
        v-for="product in products"
        :key="product.id"
      >
        <ProductCard
          :product="product"
          @add="$emit('add', $event)"
          @open="$emit('open', $event)"
        />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'

// Swiper
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'

// CSS do Swiper
import 'swiper/css'
import 'swiper/css/navigation'

defineProps({
  products: Array,
  onOpen: Function
})

// Breakpoints
const breakpoints = {
  640: { slidesPerView: 1.5, slidesPerGroup: 1 },
  768: { slidesPerView: 2, slidesPerGroup: 1 },
  1024: { slidesPerView: 3, slidesPerGroup: 1 },
  1279: { slidesPerView: 3.90, slidesPerGroup: 1 },
  1360: { slidesPerView: 3.98, slidesPerGroup: 1 },
};
</script>

<style scoped>
.product-section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  margin-bottom: 0.5rem;
}

.title-section-product {
  flex: 0 0 auto;
  margin: 0;
}

.product-section-announcement {
  flex: 1 1 0;
  min-width: 0;
  max-width: 800px;
  margin-left: 115px;
}

@media (min-width: 768px) {
  .product-section-header {
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 767.98px) {
  .product-section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .product-section-announcement {
    order: -1;
  }

  .product-section-announcement {
    width: 94%;
    max-width: none;
    margin-left: 0;
  }
}
</style>