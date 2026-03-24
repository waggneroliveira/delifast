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
      {
        id: 6,
        name: 'Hambúrguer Clássico 6',
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
        products: [
          {
            id: 7,
            name: 'Hambúrguer Clássico 7',
            description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
            price: '109,90',
            oldPrice: '119,90',
            cashback: 5,
            image: '../src/assets/images/prod.png'
          },
          {
            id: 8,
            name: 'Hambúrguer Clássico 8',
            description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
            price: '109,90',
            oldPrice: '119,90',
            cashback: 5,
            image: '../src/assets/images/prod.png'
          },
          {
            id: 9,
            name: 'Hambúrguer Clássico 9',
            description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
            price: '109,90',
            oldPrice: '119,90',
            cashback: 5,
            image: '../src/assets/images/prod.png'
          },
          {
            id: 10,
            name: 'Hambúrguer Clássico 10',
            description: '4 smash burguers com 400g de fritas, creme de cheddar de qualidade com bacon + Refr...',
            price: '109,90',
            oldPrice: '119,90',
            cashback: 5,
            image: '../src/assets/images/prod.png'
          },
        ]
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
      <main class="main">

        <!-- Topo CONTIDO -->
        <div class="container">
          <TopBar />
        </div>

        <div class="container py-4">
  
          <div class="d-flex flex-wrap">
            <Aside class="aside" />

            <div class="content">

              <div class="carousel-breakout">
                <ProductCarousel
                  :products="highlights"
                  @add="addToCart"
                />
              </div>

              <div class="list-product">
                <ProductList
                  :categories="categories"
                  @add="addToCart"
                />
              </div>

            </div>
          </div>

        </div>

        <RouterView />

      </main>
    </div>
  </div>
</template>

<style scoped>
  .list-product{
      width: 69vw;
      margin-left: calc(-30vw + 50%);
  }
  .carousel-breakout {
    width: 90vw;
    margin-left: calc(-30vw + 50%);
  }

  /* opcional: controlar o lado direito */
  .carousel-breakout .swiper {
    padding-right: 2rem;
  }
</style>
