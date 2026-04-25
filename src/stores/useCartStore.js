import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  persist: {
    key: 'cart',
    storage: localStorage,
    paths: ['items']
  },

  getters: {
    totalItems: (state) =>
      state.items.reduce((total, item) => total + item.quantity, 0),

    subTotal: (state) =>
      state.items.reduce((total, item) => {
        let itemTotal = getItemBaseTotal(item)
        return total + itemTotal
      }, 0),

    discount: (state) =>
      state.items.reduce((total, item) => {
        if (item.oldPrice && item.oldPrice > getItemBasePrice(item)) {
          return total + (item.oldPrice - getItemBasePrice(item)) * item.quantity
        }
        return total
      }, 0),

    cashbackTotal: (state) =>
      state.items.reduce(
        (total, item) =>
          total + ((getItemBasePrice(item) * (item.cashback || 0)) / 100) * item.quantity,
        0
      ),

    total: (state) => {
      let total = 0
      
      state.items.forEach(item => {
        if (item.isCombo) {
          // Para combos, usa o finalPrice diretamente
          total += (item.finalPrice || item.price) * item.quantity
        } else {
          // Para produtos normais, calcula com adicionais
          total += getItemBaseTotal(item)
        }
      })
      
      // Aplica descontos
      const discount = state.items.reduce((total, item) => {
        if (item.oldPrice && item.oldPrice > getItemBasePrice(item)) {
          return total + (item.oldPrice - getItemBasePrice(item)) * item.quantity
        }
        return total
      }, 0)
      
      return total - discount
    },
    
    getItemDetails: (state) => (itemId) => {
      const item = state.items.find(i => i.id === itemId)
      if (!item) return null
      
      if (item.isCombo) {
        return {
          ...item,
          itemTotal: (item.finalPrice || item.price) * item.quantity
        }
      }
      
      let basePrice = getItemBasePrice(item)
      let aditionalsTotal = getItemAditionalsTotal(item)
      
      return {
        ...item,
        basePrice,
        aditionalsTotal,
        aditionalsList: getItemAditionalsList(item),
        itemTotal: (basePrice + aditionalsTotal) * item.quantity
      }
    }
  },

  actions: {

    add(product) {
      const toast = useToast()

      // Gera um ID único para o item baseado nas personalizações
      const generateItemKey = (item) => {
        if (item.isCombo) {
          // Para combos, usa as seleções dos itens e addons
          return `${item.id}_combo_${JSON.stringify(item.itemSelections || {})}_${JSON.stringify(item.selectedAddons || [])}`
        }
        // Para produtos normais
        return `${item.id}_${item.selectedOption || ''}_${item.selectedSize?.id || ''}_${JSON.stringify(item.selectedFlavors?.map(f => f.id) || [])}`
      }

      const newItemKey = generateItemKey(product)
      
      // Verifica se já existe
      const existingIndex = this.items.findIndex(item => generateItemKey(item) === newItemKey)

      if (existingIndex !== -1) {
        this.items[existingIndex].quantity++
        toast.info(`Mais 1 unidade de "${product.name}" adicionada!`, { timeout: 3000 })
        return
      }

      // Para combos
      if (product.isCombo) {
        this.items.push({
          id: product.id,
          productId: product.productId || product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          finalPrice: product.finalPrice || product.price,
          basePrice: product.basePrice || product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          cashback: product.cashback || 0,
          quantity: 1,
          isCombo: true,
          comboItems: product.comboItems || [],
          comboAddons: product.comboAddons || [],
          selectedAddons: product.selectedAddons || [],
          itemSelections: product.itemSelections || {},
          savings: product.savings,
          customization: product.customization
        })
        toast.success(`"${product.name}" adicionado ao carrinho! Economia de R$ ${(product.savings || 0).toFixed(2)}`, { timeout: 3000 })
        return
      }

      // CRIA UMA CÓPIA PROFUNDA DOS ADICIONAIS COM AS QUANTIDADES
      let aditionalsCopy = []
      if (product.aditionals && product.aditionals.length > 0) {
        aditionalsCopy = JSON.parse(JSON.stringify(product.aditionals))
      }

      // Adiciona o novo item (produto normal)
      this.items.push({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        cashback: product.cashback || 0,
        quantity: 1,
        options: product.options || [],
        selectedOption: product.selectedOption || null,
        selectedSize: product.selectedSize || null,
        selectedFlavors: product.selectedFlavors || [],
        aditionals: aditionalsCopy,
        cuisineType: product.cuisineType,
        customization: product.customization,
        isCombo: false
      })

      toast.success(`"${product.name}" adicionado ao carrinho!`, { timeout: 3000 })
    },

    updateItem(product) {
      const toast = useToast()

      // Função para gerar chave única do item
      const generateItemKey = (item) => {
        if (item.isCombo) {
          return `${item.id}_combo_${JSON.stringify(item.itemSelections || {})}_${JSON.stringify(item.selectedAddons || [])}`
        }
        return `${item.id}_${item.selectedOption || ''}_${item.selectedSize?.id || ''}_${JSON.stringify(item.selectedFlavors?.map(f => f.id) || [])}`
      }

      // Gera chave do item original
      let originalKey
      if (product.isCombo) {
        originalKey = `${product.id}_combo_${JSON.stringify(product.originalItemSelections || {})}_${JSON.stringify(product.originalSelectedAddons || [])}`
      } else {
        originalKey = `${product.id}_${product.originalSelectedOption || ''}_${product.originalSelectedSize?.id || ''}_${JSON.stringify(product.originalSelectedFlavors?.map(f => f.id) || [])}`
      }
      
      // Encontra o item original
      const originalIndex = this.items.findIndex(item => generateItemKey(item) === originalKey)

      if (originalIndex === -1) return

      const originalItem = this.items[originalIndex]
      const originalQuantity = originalItem.quantity
      
      // Remove o original
      this.items.splice(originalIndex, 1)

      // Gera chave do novo item
      const newKey = generateItemKey(product)

      // Verifica se já existe com as novas opções
      const existingIndex = this.items.findIndex(item => generateItemKey(item) === newKey)

      if (product.isCombo) {
        if (existingIndex !== -1) {
          this.items[existingIndex].quantity += originalQuantity
        } else {
          this.items.push({
            id: product.id,
            productId: product.productId || product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            finalPrice: product.finalPrice || product.price,
            basePrice: product.basePrice || product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            cashback: product.cashback || 0,
            quantity: originalQuantity,
            isCombo: true,
            comboItems: product.comboItems || [],
            comboAddons: product.comboAddons || [],
            selectedAddons: product.selectedAddons || [],
            itemSelections: product.itemSelections || {},
            savings: product.savings,
            customization: product.customization
          })
        }
        toast.success(`"${product.name}" atualizado!`, { timeout: 3000 })
        return
      }

      // CRIA UMA CÓPIA DOS ADICIONAIS ATUALIZADOS
      let updatedAditionals = []
      if (product.aditionals && product.aditionals.length > 0) {
        updatedAditionals = JSON.parse(JSON.stringify(product.aditionals))
      }

      if (existingIndex !== -1) {
        this.items[existingIndex].quantity += originalQuantity
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          cashback: product.cashback || 0,
          quantity: originalQuantity,
          options: product.options || [],
          selectedOption: product.selectedOption || null,
          selectedSize: product.selectedSize || null,
          selectedFlavors: product.selectedFlavors || [],
          aditionals: updatedAditionals,
          cuisineType: product.cuisineType,
          customization: product.customization,
          isCombo: false
        })
      }

      toast.success(`"${product.name}" atualizado!`, { timeout: 3000 })
    },

    increase(itemId) {
      const toast = useToast()
      
      const item = this.items.find(i => i.id === itemId)
      
      if (item) {
        item.quantity++
        toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, { timeout: 3000 })
      }
    },

    decrease(itemId) {
      const toast = useToast()
      
      const item = this.items.find(i => i.id === itemId)
      
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
          toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, { timeout: 3000 })
        } else {
          this.remove(itemId)
        }
      }
    },

    remove(itemId) {
      const toast = useToast()
      
      const item = this.items.find(i => i.id === itemId)
      
      if (item) {
        this.items = this.items.filter(i => i.id !== itemId)
        toast.error(`"${item.name}" removido do carrinho!`, { timeout: 3000 })
      }
    },

    clear() {
      const toast = useToast()
      this.items = []
      toast.info('Carrinho esvaziado!', { timeout: 3000 })
    },
    
    calculateItemTotal(item) {
      if (item.isCombo) {
        return (item.finalPrice || item.price) * item.quantity
      }
      
      let total = getItemBasePrice(item) * item.quantity
      total += getItemAditionalsTotal(item) * item.quantity
      return total
    }
  }
})

// ========== FUNÇÕES AUXILIARES ==========

// Obtém o preço base do item (considerando tamanho selecionado)
function getItemBasePrice(item) {
  if (item.selectedSize && item.selectedSize.price) {
    return item.selectedSize.price
  }
  return item.price || 0
}

// Calcula o total base do item (preço * quantidade)
function getItemBaseTotal(item) {
  const basePrice = getItemBasePrice(item)
  let total = basePrice * item.quantity
  
  // Adiciona valor dos adicionais
  total += getItemAditionalsTotal(item) * item.quantity
  
  return total
}

// Calcula o total dos adicionais para uma unidade do item
function getItemAditionalsTotal(item) {
  if (!item.aditionals || item.aditionals.length === 0) return 0
  
  let aditionalsTotal = 0
  item.aditionals.forEach(group => {
    if (group.items && group.items.length) {
      group.items.forEach(aditional => {
        if (aditional.quantity > 0 && aditional.price) {
          aditionalsTotal += aditional.price * aditional.quantity
        }
      })
    }
  })
  
  return aditionalsTotal
}

// Retorna a lista de adicionais para exibição
function getItemAditionalsList(item) {
  if (!item.aditionals || item.aditionals.length === 0) return []
  
  const list = []
  item.aditionals.forEach(group => {
    if (group.items && group.items.length) {
      group.items.forEach(aditional => {
        if (aditional.quantity > 0) {
          list.push({
            name: aditional.name,
            quantity: aditional.quantity,
            price: aditional.price || 0,
            total: (aditional.price || 0) * aditional.quantity
          })
        }
      })
    }
  })
  
  return list
}