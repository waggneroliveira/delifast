<script setup>
    import { RouterView } from 'vue-router'
    import { ref, watch, computed, onMounted, reactive, nextTick } from 'vue'
    import { useCartStore } from '@/stores/useCartStore'
    import { useToast } from 'vue-toastification'
    import { useUserStore } from '@/stores/useUserStore'
    import delifastLoaderIcon from '@/assets/images/load.png'
    import {
      getAppearance,
      getCachedAppearance,
      getCategories,
      getProducts,
      resolveApiAssetUrl,
    } from '@/services/api'
    import { normalizeProduct } from '@/services/products'
    
    // Componentes
    import Aside from '@/components/Aside.vue'
    import Header from '@/components/Header.vue'
    import TopBar from '@/components/TopBar.vue'
    import ProductCarousel from '@/components/ProductCarousel.vue'
    import ProductList from '@/components/ProductList.vue'
    import Announcement from '@/components/Announcement.vue'
    import Cart from '@/components/Cart.vue'
    import ProductModal from '@/components/ProductModal.vue'
    import MobileBottomMenu from '@/components/MobileBottomMenu.vue'
    import OrderHistoryModal from '@/components/OrderHistoryModal.vue'
    import IdentifyModal from '@/components/IdentifyModal.vue'
    import Footer from '@/components/Footer.vue'

    // Store e Toast
    const cart = useCartStore()
    const toast = useToast()
    const userStore = useUserStore()

    // Estados do modal
    const showProductModal = ref(false)
    const selectedProduct = ref(null)
    const showOrderHistoryModal = ref(false)
    const showLoginModal = ref(false)
    const hasAnnouncements = ref(null)
    const isStartupLoading = ref(true)
    const defaultAppearance = {
      name: 'DeliFast',
      logo: null,
      colors: {},
    }
    const cachedAppearance = getCachedAppearance()
    const appearance = ref(cachedAppearance || defaultAppearance)
    const isAppearanceReady = ref(Boolean(cachedAppearance))
    const startupReady = reactive({
      appearance: false,
      header: false,
      tenant: false,
      topAnnouncements: false,
      sidebarAnnouncements: false,
    })
    let isFinalizingStartup = false

    const normalizeHexColor = (color) => {
      if (typeof color !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color)) return null
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      }
      return color
    }

    const getColorLuminance = (color) => {
      const hex = normalizeHexColor(color)
      if (!hex) return 0
      const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
      const linear = channels.map((channel) => (
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      ))
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
    }

    const getColorContrast = (firstColor, secondColor) => {
      const firstLuminance = getColorLuminance(firstColor)
      const secondLuminance = getColorLuminance(secondColor)
      const lighter = Math.max(firstLuminance, secondLuminance)
      const darker = Math.min(firstLuminance, secondLuminance)
      return (lighter + 0.05) / (darker + 0.05)
    }

    const blendColors = (foreground, background, opacity) => {
      const foregroundHex = normalizeHexColor(foreground)
      const backgroundHex = normalizeHexColor(background)
      const channels = [1, 3, 5].map((index) => {
        const foregroundChannel = parseInt(foregroundHex.slice(index, index + 2), 16)
        const backgroundChannel = parseInt(backgroundHex.slice(index, index + 2), 16)
        const blendedChannel = Math.round(
          foregroundChannel * opacity + backgroundChannel * (1 - opacity),
        )
        return blendedChannel.toString(16).padStart(2, '0')
      })
      return `#${channels.join('')}`
    }

    const loaderBrandName = computed(() => appearance.value.name || 'DeliFast')
    const loaderLogo = computed(() => (
      appearance.value.logo ? resolveApiAssetUrl(appearance.value.logo) : delifastLoaderIcon
    ))
    const loaderThemeStyle = computed(() => {
      if (!isAppearanceReady.value) {
        return {
          '--loader-background': '#F4F5F7',
          '--loader-text': '#374151',
          '--loader-primary': '#6B7280',
          '--loader-track': '#E5E7EB',
        }
      }

      const colors = appearance.value.colors || {}
      const background = normalizeHexColor(colors.primary)
        || normalizeHexColor(getComputedStyle(document.documentElement).getPropertyValue('--primary'))
        || '#10513D'
      const requestedText = normalizeHexColor(colors.text) || '#262321'
      const readableText = getColorContrast(requestedText, background) >= 4.5
        ? requestedText
        : getColorLuminance(background) > 0.179 ? '#262321' : '#FFFFFF'
      const secondary = normalizeHexColor(colors.secondary) || '#F3DFC9'
      const primary = getColorContrast(secondary, background) >= 3 ? secondary : readableText

      return {
        '--loader-background': background,
        '--loader-text': readableText,
        '--loader-primary': primary,
        '--loader-track': blendColors(secondary, background, 0.24),
      }
    })

    const loadAppearance = async () => {
      const data = await getAppearance()
      appearance.value = {
        name: typeof data.name === 'string' && data.name.trim() ? data.name.trim() : 'DeliFast',
        logo: typeof data.logo === 'string' && data.logo.trim() ? data.logo.trim() : null,
        colors: data.colors,
      }
    }

    const handleLoaderLogoError = () => {
      if (appearance.value.logo) {
        appearance.value = { ...appearance.value, logo: null }
      }
    }

    const finishStartup = async () => {
      try {
        await nextTick()
        if (document.fonts?.ready) await document.fonts.ready

        let images
        do {
          await nextTick()
          images = Array.from(document.images).filter(
            (image) => image.loading !== 'lazy' && !image.complete,
          )
          await Promise.all(images.map((image) => {
            if (image.complete) return Promise.resolve()

            return new Promise((resolve) => {
              const finish = () => resolve()
              image.addEventListener('load', finish, { once: true })
              image.addEventListener('error', finish, { once: true })
            })
          }))
        } while (images.length)
      } catch (error) {
        console.error('Não foi possível aguardar todos os arquivos da loja.', error)
      } finally {
        isStartupLoading.value = false
      }
    }

    const markStartupReady = (component) => {
      startupReady[component] = true
      if (isFinalizingStartup || !Object.values(startupReady).every(Boolean)) return

      isFinalizingStartup = true
      finishStartup()
    }

    onMounted(async () => {
      try {
        await loadAppearance()
      } catch (error) {
        console.error('Não foi possível carregar a aparência do tenant.', error)
      } finally {
        isAppearanceReady.value = true
        markStartupReady('appearance')
      }
    })

    const handleAnnouncementAvailability = (available) => {
      hasAnnouncements.value = available
    }

    // Abrir modal do produto
    const openProductModal = (product) => {
      selectedProduct.value = product
      showProductModal.value = true
    }

    // Função para lidar com o re-pedido - VERSÃO COMPLETA CORRIGIDA
    const handleReorder = (order) => {
      console.log('🎯 Reordenando pedido completo:', order.id)
      
      if (!order || !order.items || order.items.length === 0) {
        toast.error('Erro ao reordenar: pedido inválido')
        return
      }
      
      // Processar cada item do pedido
      order.items.forEach((originalItem, index) => {
        console.log(`📦 Processando item ${index + 1}:`, originalItem.name, originalItem.isCombo ? '(COMBO)' : '(NORMAL)')
        
        if (originalItem.isCombo) {
          // 🔥 PARA COMBO: Adicionar com todas as configurações preservadas
          const comboItem = JSON.parse(JSON.stringify(originalItem))
          
          comboItem.productId = comboItem.productId || comboItem.id
          comboItem.finalPrice = comboItem.finalPrice || comboItem.price
          comboItem.basePrice = comboItem.basePrice || comboItem.price
          comboItem.hasComboSelection = true
          comboItem.isComboItem = true
          
          comboItem.isReorder = true
          comboItem.reorderDate = new Date().toISOString()
          comboItem.originalOrderId = order.id
          
          if (!comboItem.itemSelections && comboItem.comboDetails) {
            comboItem.itemSelections = rebuildSelectionsFromDetails(comboItem)
          }
          
          if (comboItem.selectedAddons && comboItem.selectedAddons.length) {
            comboItem.addonsTotalPrice = comboItem.selectedAddons.reduce(
              (sum, addon) => sum + (addon.price * (addon.quantity || 1)), 0
            )
          } else {
            comboItem.selectedAddons = []
            comboItem.addonsTotalPrice = 0
          }
          
          comboItem.uniqueId = `${comboItem.productId}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`
          
          delete comboItem.comboDetails
          delete comboItem.customization
          delete comboItem.createdAt
          delete comboItem.updatedAt
          
          console.log('✅ Adicionando combo com isReorder:', comboItem.isReorder, comboItem.name)
          
          for (let i = 0; i < (comboItem.quantity || 1); i++) {
            const comboCopy = JSON.parse(JSON.stringify(comboItem))
            cart.add(comboCopy)  // ← CORRIGIDO: cart ao invés de cartStore
          }
          
        } else {
          // 🍔 PARA ITEM NORMAL
          const simpleItem = {
            id: originalItem.id,
            productId: originalItem.productId || originalItem.id,
            name: originalItem.name,
            description: originalItem.description,
            price: originalItem.finalPrice || originalItem.price,
            finalPrice: originalItem.finalPrice || originalItem.price,
            oldPrice: originalItem.oldPrice,
            originalPrice: originalItem.originalPrice || originalItem.price,
            image: originalItem.image,
            quantity: originalItem.quantity || 1,
            isCombo: false,
            cashback: originalItem.cashback || 0,
            customization: originalItem.customization,
            selectedSize: originalItem.selectedSize,
            selectedFlavors: originalItem.selectedFlavors,
            aditionals: originalItem.aditionals ? JSON.parse(JSON.stringify(originalItem.aditionals)) : [],
            aditionalsState: originalItem.aditionalsState ? { ...originalItem.aditionalsState } : {},
            isReorder: true,
            reorderDate: new Date().toISOString(),
            originalOrderId: order.id
          }
          
          console.log('✅ Adicionando item normal com isReorder:', simpleItem.isReorder, simpleItem.name)
          
          for (let i = 0; i < simpleItem.quantity; i++) {
            const itemCopy = JSON.parse(JSON.stringify(simpleItem))
            cart.add(itemCopy)  // ← CORRIGIDO: cart ao invés de cartStore
          }
        }
      })
      
      const totalItens = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
      toast.success(`${totalItens} item(ns) adicionado(s) ao carrinho!`, {
        timeout: 3000
      })
      
      showOrderHistoryModal.value = false
    }
    const handleIdentify = ({ fullName: name }) => {
      showLoginModal.value = false
      
      toast.success(`Bem-vindo(a), ${name}! Login realizado com sucesso!`, {
        timeout: 4000
      })
    }
    const openOrderHistory = () => {
      console.log('🔍 Verificando login para abrir histórico:', {
        isLogged: userStore.isLogged,
        userId: userStore.userId,
      })
      
      // Verificar se está logado
      if (!userStore.isLogged) {
        toast.warning('Faça login para ver seus pedidos!', {
          timeout: 3000
        })
        showLoginModal.value = true
        return
      }
      
      // Verificar se tem ID
      if (!userStore.userId) {
        console.error('❌ Usuário logado mas sem ID:', userStore)
        toast.error('Erro ao carregar dados do usuário. Por favor, faça login novamente.', {
          timeout: 4000
        })
        userStore.logout()
        showLoginModal.value = true
        return
      }
      
      console.log('✅ Abrindo histórico para userId:', userStore.userId)
      showOrderHistoryModal.value = true
    }

    const handleMenuChange = (key) => {
      // Lógica para outros itens do menu (home, search, delivery, profile)
      console.log('Menu alterado:', key)
    }

    // Catalogo carregado da API
    const products = ref([])

    const highlights = computed(() => products.value.filter((product) => product.featured))
    const categories = ref([])

    const loadCatalog = async () => {
      const [apiCategories, apiProducts] = await Promise.all([getCategories(), getProducts()])
      const normalizedCategories = apiCategories.map((category) => {
        const categoryName = category?.title ?? category?.name
        const categorySlug = category?.slug

        if (
          !category
          || typeof categorySlug !== 'string'
          || !categorySlug
          || typeof categoryName !== 'string'
          || !categoryName.trim()
        ) {
          throw new Error('A resposta de /category contem uma categoria sem slug ou titulo.')
        }

        return { ...category, id: categorySlug, name: categoryName.trim(), products: [] }
      })

      products.value = apiProducts.map((product) => normalizeProduct(product, apiCategories))
      normalizedCategories.forEach((category) => {
        category.products = products.value.filter(
          (product) => !product.featured && product.category === category.id,
        )
      })

      const uncategorizedProducts = products.value.filter(
        (product) => !product.featured
          && !normalizedCategories.some((category) => category.id === product.category),
      )
      if (uncategorizedProducts.length) {
        normalizedCategories.push({
          id: 'outros',
          name: 'Outros',
          products: uncategorizedProducts,
        })
      }

      categories.value = normalizedCategories.filter((category) => category.products.length > 0)
      if (typeof window !== 'undefined') window.products = products.value
    }

    onMounted(async () => {
      try {
        await loadCatalog()
      } catch (error) {
        console.error('Nao foi possivel carregar o catalogo da API.', error)
      } finally {
        if (!highlights.value.length) markStartupReady('topAnnouncements')
      }
    })

    // ========== FUNÇÕES PARA COMBOS ==========
    
    // Verifica se um produto é combo
    const isCombo = (product) => {
      return product?.isCombo === true
    }

    // Calcula o preço total do combo baseado nas escolhas do usuário
    const calculateComboPrice = (combo, selections = {}) => {
      let totalPrice = combo.price // Preço base do combo
      
      // Adiciona preço dos addons selecionados
      if (selections.selectedAddons) {
        selections.selectedAddons.forEach(addon => {
          totalPrice += addon.price * addon.quantity
        })
      }
      
      // Adiciona customizações extras dos itens
      if (selections.itemCustomizations) {
        Object.values(selections.itemCustomizations).forEach(custom => {
          if (custom.selectedToppings) {
            custom.selectedToppings.forEach(topping => {
              totalPrice += topping.price
            })
          }
          if (custom.selectedSize && custom.selectedSize.price) {
            const originalItemPrice = combo.comboItems.find(i => i.name === custom.itemName)?.price || 0
            totalPrice += (custom.selectedSize.price - originalItemPrice)
          }
        })
      }
      
      return totalPrice
    }

    // Prepara o combo para adicionar ao carrinho
    const prepareComboForCart = (combo, selections = {}) => {
      return {
        id: `${combo.id}_${Date.now()}`,
        productId: combo.id,
        name: combo.name,
        description: combo.description,
        basePrice: combo.price,
        finalPrice: calculateComboPrice(combo, selections),
        quantity: 1,
        isCombo: true,
        comboItems: combo.comboItems,
        comboAddons: combo.comboAddons,
        selections: selections,
        image: combo.image?.[0] || combo.image,
        savings: combo.savings
      }
    }

    // Função para adicionar combo ao carrinho
    const addComboToCart = (combo, selections = {}) => {
      const comboItem = prepareComboForCart(combo, selections)
      cart.add(comboItem)
      toast.success(`${combo.name} adicionado ao carrinho! Economia de R$ ${combo.savings?.toFixed(2) || '0,00'}`, {
        timeout: 3000
      })
    }

    // ========== FUNÇÕES PARA PRODUTOS NORMAIS ==========

    // Função para adicionar produto normal ao carrinho
    function addToCart(product, customizations = {}) {
      const cartItem = {
        id: `${product.id}_${Date.now()}`,
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        finalPrice: calculateFinalPrice(product, customizations),
        quantity: 1,
        customizations,
        image: product.image?.[0] || product.image,
        isCombo: false
      }
      
      cart.add(cartItem)
      toast.success(`${product.name} adicionado ao carrinho!`, {
        timeout: 2000
      })
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
      
      return finalPrice
    }

    // Função unificada para adicionar ao carrinho (produto ou combo)
    const addItemToCart = (item, selections = {}) => {
      if (isCombo(item)) {
        addComboToCart(item, selections)
      } else {
        addToCart(item, selections)
      }
    }

    // Monitora mudanças no carrinho
    watch(() => cart.items, (newItems) => {
      console.log('Carrinho atualizado:', JSON.parse(JSON.stringify(newItems)))
    }, { deep: true })

</script>

<template>
  <div class="container-fluid p-0">
    <Transition name="system-loader">
      <div
        v-if="isStartupLoading"
        class="system-loader"
        :style="loaderThemeStyle"
        role="status"
        aria-live="polite"
      >
        <div class="loader-card">
          <div v-if="isAppearanceReady" class="loader-icon-wrapper">
            <img
              :src="loaderLogo"
              class="loader-icon"
              :alt="`Logo de ${loaderBrandName}`"
              @error="handleLoaderLogoError"
            >
          </div>
          
          <p
            v-if="isAppearanceReady"
            class="loader-brand position-relative"
            :aria-label="loaderBrandName"
          >
            <span class="brand-part">{{ loaderBrandName }}</span>
          </p>

          <div class="loader-text-group">
            <p class="loader-title mb-1">Estamos preparando tudo para você!</p>
            <p class="loader-description mb-3">Carregando novidades e ofertas especiais...</p>
          </div>

          <div class="loader-footer">
            <div class="loader-spinner" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    </Transition>

    <Header class="header" @startup-ready="markStartupReady('header')" />
    
    <MobileBottomMenu 
    @change="handleMenuChange" 
    @open-orders="openOrderHistory"/>
    
    <Cart />

    <div class="layout">
      <main class="main">

        <!-- Topo CONTIDO -->
        <div class="container">
          <TopBar @startup-ready="markStartupReady('tenant')" />
        </div>

        <div class="container py-0">
  
          <div class="d-flex flex-wrap">
            <!-- PASSANDO AS CATEGORIAS PARA O ASIDE -->
            <Aside
              :categories="categories"
              class="aside"
              @startup-ready="markStartupReady('sidebarAnnouncements')"
            />

            <div
              class="content w-mobile-100"
              :class="{
                'mt-5': hasAnnouncements === false,
                'content-no-highlights': !highlights.length,
              }"
            >
              <div v-if="highlights.length" class="carousel-breakout">
                <ProductCarousel
                  :products="highlights"
                  @open="openProductModal"
                >
                  <template #announcement>
                    <Announcement
                      @availability-change="handleAnnouncementAvailability"
                      @startup-ready="markStartupReady('topAnnouncements')"
                    />
                  </template>
                </ProductCarousel>
              </div>

              <div v-if="categories.length" class="list-product">
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
        v-model:show="showProductModal"
        :product="selectedProduct"
        @add-to-cart="addItemToCart"
      />
    </div>

    <OrderHistoryModal 
      v-if="showOrderHistoryModal"
      v-model="showOrderHistoryModal"
      :user-id="userStore.userId"
      @reorder="handleReorder"
    />
    
    <!-- IdentifyModal para login -->
    <IdentifyModal
      v-model="showLoginModal"
      @submit="handleIdentify"
    />

    <Footer/>
  </div>
</template>

<style scoped>
.system-loader {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--loader-background, #fef3e5);
  transition: background-color 350ms ease;
}

.system-loader-enter-active,
.system-loader-leave-active {
  transition: opacity 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

.system-loader-enter-from,
.system-loader-leave-to {
  opacity: 0;
}

.loader-card {
  width: min(345px, 100%);
  padding: 24px 28px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: transparent;
  box-shadow: none;
  border: none;
}

.loader-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  width: 160px;
  height: 160px;
  flex: 0 0 160px;
  background: #FFF;
  border: 7px solid rgba(0, 0, 0, 0.10);
  border-radius: 100%;
  overflow: hidden;
}

.loader-icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.loader-brand {
  margin: 0 0 16px;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
  font-size: clamp(1.7rem, 7vw, 2.3rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.1;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.brand-part {
  max-width: 100%;
  background: linear-gradient(
    90deg,
    var(--loader-text) 0%,
    var(--loader-text) 38%,
    var(--loader-primary) 50%,
    var(--loader-text) 62%,
    var(--loader-text) 100%
  );
  background-size: 250% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: text-shimmer 3.5s linear infinite;
}

.loader-text-group {
  margin-bottom: 22px;
}

.loader-title {
  color: var(--loader-text, #262321);
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
}

.loader-description {
  color: var(--loader-text, #74695e);
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.78;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
}

.loader-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader-spinner {
  width: 32px;
  height: 32px;
  border: 2.5px solid var(--loader-track, #f3dfc9);
  border-top-color: var(--loader-primary, #f36b18);
  border-right-color: var(--loader-primary, #f36b18);
  border-radius: 50%;
  animation: loader-spin 900ms linear infinite;
}

@keyframes text-shimmer {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}

@keyframes loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-spinner,
  .brand-part {
    animation: none;
  }
}

@media (max-width: 768px) {
  .aside{
    width: 100%;
  }
  .w-mobile-100{
    width: 100%;
  }
  .carousel-breakout{
    margin-left: 0 !important;
    width: 100vw !important;
  }
}
  .list-product{
      width: 69vw;
      margin-left: calc(-30vw + 50%);
  }
  .content-no-highlights .list-product{
      width: 100%;
      margin-left: 0;
  }
  @media (min-width: 769px) {
    .content-no-highlights{
      flex: 1 1 0;
      min-width: 0;
    }
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
  @media (max-width: 680px) {
    .carousel-breakout{
      margin-top: 0;
    }
    .carousel-breakout{
      padding-bottom: 10px;
    }
    .swiper-button-prev, .swiper-button-next{
      top: 25px !important;
    }
  }
</style>