<template>
  <div class="mb-4">
    <h5 class="mb-3">Destaques</h5>

    <Swiper
      :modules="[]"
      :space-between="12"
      :slides-per-view="1.2"
      :breakpoints="breakpoints"
      navigation
      class="pb-2 swiper-overflow-fix"
    >
      <SwiperSlide
        v-for="product in products"
        :key="product.id"
      >
        <ProductCard
          :product="product"
          @add="$emit('add', $event)"
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
  products: Array
})

// Breakpoints (ajuste fino aqui 👇)
const breakpoints = {
  576: {
    slidesPerView: 2.2
  },
  768: {
    slidesPerView: 3
  },
  992: {
    slidesPerView: 4
  },
  1360: {
    slidesPerView: 4.8
  }
}
</script>

<style scoped>
  .swiper-overflow-fix {
    padding-right: 16px;
  }
</style>