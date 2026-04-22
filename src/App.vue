<script setup>
    import { RouterView } from 'vue-router'
    import { ref, watch, computed, onMounted } from 'vue'
    import { useCartStore } from '@/stores/useCartStore'
    
    // Componentes
    import Aside from '@/components/Aside.vue'
    import Header from '@/components/Header.vue'
    import TopBar from '@/components/TopBar.vue'
    import ProductCarousel from '@/components/ProductCarousel.vue'
    import ProductList from '@/components/ProductList.vue'
    import Announcement from '@/components/Announcement.vue'
    import Cart from '@/components/Cart.vue'
    import ProductModal from '@/components/ProductModal.vue'

    // Store
    const cart = useCartStore()

    // Estados do modal
    const showModal = ref(false)
    const selectedProduct = ref(null)

    // Abrir modal do produto
    const openProductModal = (product) => {
      selectedProduct.value = product
      showModal.value = true
    }

    // Dados da aplicação - Estrutura unificada e extensível
    const products = ref([
      {
        id: 1,
        name: 'Hambúrguer Clássico',
        description: '4 smash burgers com 400g de fritas, creme de cheddar com bacon + Refrigerante',
        price: 109.90,
        oldPrice: 119.90,
        cashback: 5,
        image: ['../src/assets/images/prod.png'],
        category: 'hamburguers',
        tags: ['promoção', 'bacon', 'mais pedido'],
        productType: 'food',
        cuisineType: 'burger',
        customization: {
          hasSize: false,
          hasFlavors: false,
          hasToppings: true,
          toppings: [
            { id: 1, name: 'Queijo Extra', price: 3.50, category: 'cheese', maxQuantity: 2 },
            { id: 2, name: 'Bacon Extra', price: 4.00, category: 'meat', maxQuantity: 2 },
            { id: 3, name: 'Cheddar', price: 3.00, category: 'cheese' },
            { id: 4, name: 'Molho Especial', price: 2.00, category: 'sauce' }
          ],
          hasSpiciness: true,
          spicinessLevels: [
            { id: 1, level: 0, name: 'Sem Pimenta' },
            { id: 2, level: 1, name: 'Leve' },
            { id: 3, level: 2, name: 'Médio' },
            { id: 4, level: 3, name: 'Picante' }
          ]
        },
        specifications: {
          preparationTime: 20,
          calories: 850,
          serves: 1,
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          allergens: ['glúten', 'lactose', 'ovos']
        },
        stock: { available: true, quantity: 50, maxPerOrder: 5 },
        featured: true,
        order: 1
      },
      {
        id: 2,
        name: 'Pizza Portuguesa',
        description: 'Molho especial, presunto, ovos, cebola, azeitona e queijo mussarela',
        price: 45.90,
        oldPrice: 55.90,
        cashback: 8,
        image: ['../src/assets/images/prod.png'],
        category: 'pizzas',
        tags: ['tradicional', 'salgada', 'promoção'],
        productType: 'food',
        cuisineType: 'pizza',
        customization: {
          hasSize: true,
          sizes: [
            { id: 1, name: 'P', price: 45.90, description: '4 fatias - 2 pessoas' },
            { id: 2, name: 'M', price: 59.90, description: '6 fatias - 3 pessoas' },
            { id: 3, name: 'G', price: 79.90, description: '8 fatias - 4 pessoas', oldPrice: 89.90 }
          ],
          hasFlavors: true,
          flavors: [
            { id: 1, name: 'Portuguesa', price: 0, description: 'Presunto, ovo, cebola, azeitona', isRecommended: true },
            { id: 2, name: 'Calabresa', price: 5.00, description: 'Calabresa, cebola, mussarela' },
            { id: 3, name: 'Frango com Catupiry', price: 8.00, description: 'Frango desfiado, catupiry, milho' },
            { id: 4, name: 'Margherita', price: 3.00, description: 'Molho, mussarela, manjericão' }
          ],
          maxFlavors: 2,
          hasToppings: true,
          toppings: [
            { id: 5, name: 'Queijo Extra', price: 4.00, category: 'cheese' },
            { id: 6, name: 'Orégano', price: 0, category: 'sauce' },
            { id: 7, name: 'Azeitona Extra', price: 2.00, category: 'vegetable' }
          ],
          hasSpiciness: false
        },
        specifications: {
          preparationTime: 25,
          serves: 4,
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          allergens: ['glúten', 'lactose']
        },
        stock: { available: true, quantity: 30 },
        featured: true,
        order: 2
      },
      {
        id: 3,
        name: 'Açaí Tradicional',
        description: 'Açaí puro da Amazônia, sem xarope, acompanha granola',
        price: 19.90,
        cashback: 3,
        image: ['../src/assets/images/prod.png'],
        category: 'acai',
        tags: ['natural', 'saudável', 'vegano'],
        productType: 'dessert',
        cuisineType: 'acai',
        customization: {
          hasSize: true,
          sizes: [
            { id: 1, name: '300ml', price: 19.90 },
            { id: 2, name: '500ml', price: 27.90 },
            { id: 3, name: '700ml', price: 34.90 }
          ],
          hasFlavors: false,
          hasToppings: true,
          toppings: [
            { id: 8, name: 'Granola', price: 2.00, category: 'sweet' },
            { id: 9, name: 'Banana', price: 1.50, category: 'sweet' },
            { id: 10, name: 'Leite Condensado', price: 2.50, category: 'sweet' },
            { id: 11, name: 'Morango', price: 2.00, category: 'sweet' },
            { id: 12, name: 'Paçoca', price: 2.00, category: 'sweet' }
          ],
          hasSpiciness: false
        },
        specifications: {
          calories: 320,
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          allergens: []
        },
        stock: { available: true, quantity: 100 },
        featured: true,
        order: 3
      },
      {
        id: 4,
        name: 'Coca-Cola 2L',
        description: 'Refrigerante gelado',
        price: 12.90,
        image: ['../src/assets/images/prod.png'],
        category: 'bebidas',
        tags: ['refrigerante', 'gelada'],
        productType: 'beverage',
        cuisineType: 'drink',
        customization: {
          hasSize: true,
          sizes: [
            { id: 1, name: 'Lata 350ml', price: 5.90 },
            { id: 2, name: '600ml', price: 8.90 },
            { id: 3, name: '2 Litros', price: 12.90 }
          ],
          hasFlavors: false,
          hasToppings: false,
          hasSpiciness: false
        },
        specifications: {
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          allergens: []
        },
        stock: { available: true, quantity: 200 },
        featured: false,
        order: 4
      }
    ])

    // Produtos em destaque para o carrossel
    const highlights = computed(() => {
      return products.value.filter(p => p.featured === true)
    })

    // Categorias agrupadas para exibição
    const categories = computed(() => {
      const categoryMap = new Map()
      
      products.value.forEach(product => {
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, {
            id: product.category,
            name: getCategoryName(product.category),
            products: []
          })
        }
        categoryMap.get(product.category).products.push(product)
      })
      
      return Array.from(categoryMap.values())
    })

    // Helper para nomes das categorias
    const getCategoryName = (categoryKey) => {
      const names = {
        'hamburguers': 'Hambúrgueres',
        'pizzas': 'Pizzas',
        'acai': 'Açaí',
        'bebidas': 'Bebidas',
        'entradas': 'Entradas',
        'sobremesas': 'Sobremesas'
      }
      return names[categoryKey] || categoryKey
    }

    // Função para adicionar ao carrinho
    function addToCart(product, customizations = {}) {
      const cartItem = {
        id: `${product.id}_${Date.now()}`,
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        finalPrice: calculateFinalPrice(product, customizations),
        quantity: 1,
        customizations,
        image: product.images[0]
      }
      
      cart.add(cartItem)
    }

    // Calcula preço final baseado nas personalizações
    const calculateFinalPrice = (product, customizations) => {
      let finalPrice = product.price
      
      if (customizations.selectedSize) {
        finalPrice = customizations.selectedSize.price
      }
      
      if (customizations.selectedFlavors) {
        customizations.selectedFlavors.forEach(flavor => {
          finalPrice += flavor.price
        })
      }
      
      if (customizations.selectedToppings) {
        customizations.selectedToppings.forEach(topping => {
          finalPrice += topping.price
        })
      }
      
      if (customizations.selectedSpiciness) {
        // Preço não altera com picância
      }
      
      return finalPrice
    }

    // Monitora mudanças no carrinho
    watch(() => cart.items, (newItems) => {
      console.log('Carrinho atualizado:', JSON.parse(JSON.stringify(newItems)))
    }, { deep: true })

    // Inicialização
    onMounted(() => {
      console.log('App inicializado com estrutura unificada de produtos')
    })
</script>


<template>
  <div class="container-fluid p-0">
    <Header class="header" />
    
    <Cart />

    <div class="layout">
      <main class="main">

        <!-- Topo CONTIDO -->
        <div class="container">
          <TopBar />          
        </div>

        <div class="container py-0">
  
          <div class="d-flex flex-wrap">
            <Aside class="aside" />

            <div class="content">

              <Announcement/>
              
              <div class="carousel-breakout">
                <!-- 
                  Adicionar caso queira o click de adc ao carrinho 
                  @add="addToCart"
                -->
                <ProductCarousel
                  :products="highlights"
                  @open="openProductModal"
                />
              </div>

              <div class="list-product">
                <ProductList
                  :categories="categories"
                  @open="openProductModal"
                />
              </div>

            </div>
          </div>

        </div>

        <RouterView />

      </main>

      <ProductModal
        v-model:show="showModal"
        :product="selectedProduct"
      />
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
    margin-top: -40px;
  }

  /* opcional: controlar o lado direito */
  .carousel-breakout .swiper {
    padding-right: 2rem;
  }
</style>
