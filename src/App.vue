<script setup>
    import { RouterView } from 'vue-router'
    import Aside from '@/components/Aside.vue'
    import Header from '@/components/Header.vue'
    import TopBar from '@/components/TopBar.vue'
    import ProductCarousel from '@/components/ProductCarousel.vue'
    import ProductList from '@/components/ProductList.vue'

    const highlights = [
      {
        id: 1,
        name: 'Hambúrguer Clássico',
        description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
        price: '109,90',
        oldPrice: '119,90',
        cashback: 5,
        image: '../src/assets/images/prod.png'
      },
      {
        id: 2,
        name: 'Hambúrguer Clássico 2',
        description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
        price: '109,90',
        oldPrice: '119,90',
        cashback: 5,
        image: '../src/assets/images/prod.png'
      },
      {
        id: 3,
        name: 'Hambúrguer Clássico 3',
        description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
        price: '109,90',
        oldPrice: '119,90',
        cashback: 5,
        image: '../src/assets/images/prod.png'
      },
      {
        id: 4,
        name: 'Hambúrguer Clássico 4',
        description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
        price: '109,90',
        oldPrice: '119,90',
        cashback: 5,
        image: '../src/assets/images/prod.png'
      },
      {
        id: 5,
        name: 'Hambúrguer Clássico 5',
        description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
        price: '109,90',
        oldPrice: '119,90',
        cashback: 5,
        image: '../src/assets/images/prod.png'
      },
    ]

    const categories = [
      {
        id: 1,
        name: 'Entradas',
        products: [/* array */]
      },
      {
        id: 2,
        name: 'Bebidas',
        products: [/* array */]
      }
    ]

    function addToCart(product) {
      console.log('Adicionar:', product)
    }
</script>

<template>
  <div class="container-fluid p-0">
    <Header class="header" />
    <div class="layout">
      <Aside class="aside" />
      <main class="main">
        <TopBar/>
          <div class="container py-4">

            <!-- Destaques -->
            <ProductCarousel :products="highlights" @add="addToCart" />

            <!-- Categorias -->
            <ProductList :categories="categories" @add="addToCart" />

          </div>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
  .layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: auto 1fr;

    grid-template-areas:
      "header header"
      "aside  main";

    min-height: 100vh;
  }

  .header {
    grid-area: header;
    z-index: 10;
  }

  .aside {
    grid-area: aside;
    z-index: 12;
  }

  .main {
    grid-area: main;
  }
  @media (max-width: 768px) {
    .layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr;
        grid-template-areas:
            "header"
            "aside"
            "main";
    }
  }
</style>
