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
      resolveApiAssetUrl,
    } from '@/services/api'
    
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

    // Dados da aplicação - Estrutura unificada e extensível com suporte a COMBOS
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
        isCombo: false,
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
        oldPrice: 0,
        cashback: 8,
        image: ['../src/assets/images/prod.png'],
        category: 'pizzas',
        tags: ['tradicional', 'salgada', 'promoção'],
        productType: 'food',
        cuisineType: 'pizza',
        isCombo: false,
        customization: {
          hasSize: true,
          sizes: [
            { id: 1, name: 'P', price: 45.90, description: '4 fatias - 2 pessoas', oldPrice: 55.90 },
            { id: 2, name: 'M', price: 59.90, description: '6 fatias - 3 pessoas', oldPrice: 69.90 },
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
      
      // EXEMPLO: COMBO DE YAKISOBA COM OPÇÕES
      {
        id: 6,
        name: 'Combo Yakisoba Completo',
        description: 'Yakisoba + Refrigerante + 4 Rolinhos',
        price: 59.90,
        oldPrice: 89.90,
        cashback: 10,
        image: ['../src/assets/images/prod.png'],
        category: 'combos',
        tags: ['promoção', 'combo', 'yakisoba'],
        productType: 'combo',
        cuisineType: 'japanese',
        isCombo: true,
        
        // Itens do combo
        comboItems: [
          {
            id: 'yakisoba',
            name: 'Yakisoba',
            quantity: 1,
            required: true,
            // Sem opções de escolha, fixo
            options: null
          },
          {
            id: 'refrigerante',
            name: 'Refrigerante',
            quantity: 1,
            required: true,
            // ✅ COM OPÇÃO DE ESCOLHA (select)
            options: {
              type: 'select',  // select, radio, checkbox
              title: 'Escolha o sabor do refrigerante',
              required: true,
              maxSelections: 1,
              choices: [
                { id: 1, name: 'Kuat', price: 0, default: true },
                { id: 2, name: 'Fanta Laranja', price: 0 },
                { id: 3, name: 'Fanta Uva', price: 0 },
                { id: 4, name: 'Pepsi', price: 0 },
                { id: 5, name: 'Guaraná', price: 0 }
              ]
            }
          },
          {
            id: 'rolinhos',
            name: 'Rolinhos Primavera',
            quantity: 4,
            required: true,
            // ✅ COM OPÇÃO DE ESCOLHA MÚLTIPLA (checkbox) com limite
            options: {
              type: 'checkbox',
              title: 'Escolha até 4 rolinhos (pode repetir sabores)',
              required: true,
              maxSelections: 4,
              choices: [
                { id: 1, name: 'Queijo Misto', price: 0, maxPerOption: 4 },
                { id: 2, name: 'Romeu e Julieta', price: 0, maxPerOption: 4 },
                { id: 3, name: 'Carne', price: 0, maxPerOption: 4 },
                { id: 4, name: 'Frango', price: 0, maxPerOption: 4 },
                { id: 5, name: 'Legumes', price: 0, maxPerOption: 4 }
              ]
            }
          }
        ],
        
        // Addons extras (opcionais pagos)
        comboAddons: [
          {
            id: 1,
            name: 'Hashi (par de palitinhos)',
            price: 1.00,
            maxQuantity: 2
          },
          {
            id: 2,
            name: 'Molho Especial',
            price: 2.00,
            maxQuantity: 3
          }
        ],
        
        savings: 30.00,
        savingsPercent: 33,
        stock: { available: true, quantity: 20, maxPerOrder: 2 },
        featured: true,
        order: 0
      },
      
      // EXEMPLO: COMBO DE PIZZA COM ESCOLHA DE BORDA E SABORES
      {
        id: 7,
        name: 'Combo Pizza Especial',
        description: 'Pizza Média + Refrigerante 1L + Sobremesa',
        price: 69.90,
        oldPrice: 99.90,
        cashback: 8,
        image: ['../src/assets/images/prod.png'],
        category: 'combos',
        tags: ['promoção', 'combo', 'pizza'],
        productType: 'combo',
        cuisineType: 'pizza',
        isCombo: true,
        
        comboItems: [
          {
            id: 'pizza',
            name: 'Pizza Média',
            quantity: 1,
            required: true,
            // ✅ Opção de escolha de sabores (máximo 2 sabores)
            options: {
              type: 'multicheckbox',
              title: 'Escolha os sabores da pizza (máx. 2)',
              required: true,
              maxSelections: 2,
              choices: [
                { id: 1, name: 'Portuguesa', price: 0, description: 'Presunto, ovo, cebola, azeitona' },
                { id: 2, name: 'Calabresa', price: 0, description: 'Calabresa, cebola, mussarela' },
                { id: 3, name: 'Frango com Catupiry', price: 5.00, description: 'Frango desfiado, catupiry' },
                { id: 4, name: 'Margherita', price: 0, description: 'Molho, mussarela, manjericão' },
                { id: 5, name: 'Quatro Queijos', price: 5.00, description: 'Mussarela, provolone, parmesão, catupiry' }
              ]
            }
          },
          {
            id: 'borda',
            name: 'Borda da Pizza',
            quantity: 1,
            required: false,  // Opcional
            // ✅ Opção de escolha de borda (select)
            options: {
              type: 'select',
              title: 'Escolha a borda (opcional)',
              required: false,
              maxSelections: 1,
              choices: [
                { id: 1, name: 'Sem borda', price: 0, default: true },
                { id: 2, name: 'Borda de Catupiry', price: 5.00 },
                { id: 3, name: 'Borda de Cheddar', price: 5.00 },
                { id: 4, name: 'Borda de Chocolate', price: 6.00 }
              ]
            }
          },
          {
            id: 'refrigerante',
            name: 'Refrigerante 1L',
            quantity: 1,
            required: true,
            options: {
              type: 'radio',
              title: 'Escolha o refrigerante',
              required: true,
              maxSelections: 1,
              choices: [
                { id: 1, name: 'Coca-Cola', price: 0 },
                { id: 2, name: 'Coca-Cola Zero', price: 0 },
                { id: 3, name: 'Guaraná', price: 0 },
                { id: 4, name: 'Pepsi', price: 0 }
              ]
            }
          },
          {
            id: 'sobremesa',
            name: 'Sobremesa',
            quantity: 1,
            required: true,
            options: {
              type: 'radio',
              title: 'Escolha sua sobremesa',
              required: true,
              maxSelections: 1,
              choices: [
                { id: 1, name: 'Pudim', price: 0 },
                { id: 2, name: 'Torta de Limão', price: 0 },
                { id: 3, name: 'Brownie', price: 3.00 },
                { id: 4, name: 'Sorvete', price: 2.00 }
              ]
            }
          }
        ],
        
        comboAddons: [
          {
            id: 1,
            name: 'Molho Especial',
            price: 2.00,
            maxQuantity: 3
          }
        ],
        
        savings: 30.00,
        savingsPercent: 30,
        stock: { available: true, quantity: 15, maxPerOrder: 3 },
        featured: true,
        order: 0
      },
      
      // EXEMPLO: COMBO DE HAMBÚRGUER COM ESCOLHA DE ACOMPANHAMENTO E BEBIDA
      {
        id: 8,
        name: 'Combo Burger',
        description: 'Hambúrguer + Acompanhamento + Bebida',
        price: 39.90,
        oldPrice: 59.90,
        cashback: 5,
        image: ['../src/assets/images/prod.png'],
        category: 'combos',
        tags: ['promoção', 'combo', 'hamburguer'],
        productType: 'combo',
        cuisineType: 'burger',
        isCombo: true,
        
        comboItems: [
          {
            id: 'hamburguer',
            name: 'Hambúrguer Artesanal',
            quantity: 1,
            required: true,
            // Sem opções, fixo
            options: null
          },
          {
            id: 'acompanhamento',
            name: 'Acompanhamento',
            quantity: 1,
            required: true,
            options: {
              type: 'select',
              title: 'Escolha o acompanhamento',
              required: true,
              maxSelections: 1,
              choices: [
                { id: 1, name: 'Batata Frita', price: 0, default: true },
                { id: 2, name: 'Batata Rústica', price: 0 },
                { id: 3, name: 'Onion Rings', price: 3.00 },
                { id: 4, name: 'Salada', price: 0 }
              ]
            }
          },
          {
            id: 'bebida',
            name: 'Bebida',
            quantity: 1,
            required: true,
            options: {
              type: 'select',
              title: 'Escolha a bebida',
              required: true,
              maxSelections: 1,
              choices: [
                { id: 1, name: 'Coca-Cola 350ml', price: 0 },
                { id: 2, name: 'Guaraná 350ml', price: 0 },
                { id: 3, name: 'Suco Natural', price: 3.00 },
                { id: 4, name: 'Água', price: 0 }
              ]
            }
          }
        ],
        
        comboAddons: [
          {
            id: 1,
            name: 'Queijo Extra',
            price: 3.00,
            maxQuantity: 2
          },
          {
            id: 2,
            name: 'Bacon Extra',
            price: 4.00,
            maxQuantity: 2
          }
        ],
        
        savings: 20.00,
        savingsPercent: 33,
        stock: { available: true, quantity: 30, maxPerOrder: 5 },
        featured: true,
        order: 0
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
        isCombo: false,
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
        isCombo: false,
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
      },
      {
        id: 5,
        name: 'Coca-Cola 1L',
        description: 'Refrigerante gelado',
        price: 9.90,
        image: ['../src/assets/images/prod.png'],
        category: 'bebidas',
        tags: ['refrigerante', 'gelada'],
        productType: 'beverage',
        cuisineType: 'drink',
        isCombo: false,
        customization: {
          hasSize: true,
          sizes: [],
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
        order: 5
      }
    ])

    // Produtos em destaque para o carrossel
    const highlights = computed(() => {
      return products.value.filter(p => p.featured === true)
    })

    const categories = ref([])

    // Helper para nomes das categorias
    const getCategoryName = (categoryKey) => {
      const names = {
        'hamburguers': 'Hambúrgueres',
        'pizzas': 'Pizzas',
        'acai': 'Açaí',
        'bebidas': 'Bebidas',
        'entradas': 'Entradas',
        'sobremesas': 'Sobremesas',
        'combos': 'Combos'
      }
      return names[categoryKey] || categoryKey
    }

    const normalizeCategoryKey = (value) => String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')

    const loadCategories = async () => {
      const apiCategories = await getCategories()

      categories.value = apiCategories.map((category) => {
        const categoryName = category?.title ?? category?.name
        const categoryId = category?.id ?? category?.slug

        if (
          !category
          || categoryId == null
          || typeof categoryName !== 'string'
          || !categoryName.trim()
        ) {
          throw new Error('A resposta de /category contém uma categoria sem slug ou título.')
        }

        const categoryKeys = [category.id, category.slug, category.title, category.name]
          .filter((key) => key != null)
          .map(normalizeCategoryKey)
        const normalizedCategoryName = normalizeCategoryKey(categoryName)

        return {
          ...category,
          id: categoryId,
          name: categoryName.trim(),
          products: products.value.filter((product) => {
            const productKeys = [product.category, product.category_id]
              .filter((key) => key != null)
              .map(normalizeCategoryKey)
            const productDisplayName = normalizeCategoryKey(getCategoryName(product.category))

            return productKeys.some((key) => categoryKeys.includes(key))
              || productDisplayName === normalizedCategoryName
          }),
        }
      })
    }

    onMounted(async () => {
      try {
        await loadCategories()
      } catch (error) {
        console.error('Não foi possível carregar as categorias da API.', error)
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

    // Helper para obter produtos disponíveis para combo
    const getAvailableProductsForCombo = () => {
      return products.value.filter(p => !p.isCombo)
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

    // Inicialização
    onMounted(() => {
      console.log('App inicializado com estrutura de produtos e combos')
      console.log('Produtos disponíveis:', products.value.length)
      console.log('Combos disponíveis:', products.value.filter(p => p.isCombo).length)
    })

    // Expor produtos globalmente para acesso do Cart
    if (typeof window !== 'undefined') {
      window.products = products.value
    }
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

            <div class="content w-mobile-100" :class="{ 'mt-5': hasAnnouncements === false }">
              <div class="carousel-breakout">
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