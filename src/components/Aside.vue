<template>
  <aside class="aside position-relative">

    <!-- Menu -->
    <div class="menu w-100 d-none d-md-flex flex-column">
      <a href="#" class="menu-link active">Combos promocionais</a>
      <a href="#" class="menu-link">Entradas</a>
      <a href="#" class="menu-link">Hamburgers</a>
      <a href="#" class="menu-link">Carne</a>
      <a href="#" class="menu-link">Bebidas</a>
      <a href="#" class="menu-link">Açaí</a>
    </div>

    <!-- Mobile Swiper -->
    <Swiper
      v-if="menuItems.length"
      :modules="[Navigation]"
      class="d-md-none menu-swiper"
      :slides-per-view="'auto'"
      space-between="8"
      navigation
    >
      <SwiperSlide v-for="(item, index) in menuItems" :key="index">
        <a href="#" class="menu-link">{{ item }}</a>
      </SwiperSlide>
    </Swiper>

    <!-- Banner -->
    <div class="mt-5 text-start d-none d-md-block">
      <img 
        src="@/assets/images/anuncio.png" 
        class="img-fluid"
      />
    </div>

  </aside>
</template>

<script setup>
// Swiper
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'

// CSS do Swiper
import 'swiper/css'
import 'swiper/css/navigation'

const menuItems = [
  "Combos promocionais",
  "Entradas",
  "Hamburgers",
  "Carne",
  "Bebidas",
  "Açaí"
];
</script>

<style scoped>
.aside {
  width: 224px;
  height: 100%;
}

/* Menu desktop */
.menu-link {
  padding: 10px 0;
  color: #666;
  text-decoration: none;
  border-bottom: 1px solid #eee;
  font-size: clamp(0.875rem, 1vw, 1rem);
  transition: 0.2s;
  width: 75%;
}

.menu-link:hover {
  color: #A4268E;
}

.menu-link.active {
  color: #A4268E;
  font-weight: 500;
  border-bottom: 2px solid #A4268E;
}

/* Mobile Swiper styling */
.menu-swiper {
  padding: 10px 0;
}

.menu-swiper .swiper-slide {
  width: auto;
}
</style>