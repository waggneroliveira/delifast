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
        let itemTotal = item.price * item.quantity
        
        if (item.aditionals && item.aditionals.length > 0) {
          item.aditionals.forEach(group => {
            group.items.forEach(aditional => {
              if (aditional.quantity > 0 && aditional.price) {
                itemTotal += (aditional.price * aditional.quantity) * item.quantity
              }
            })
          })
        }
        
        return total + itemTotal
      }, 0),

    discount: (state) =>
      state.items.reduce((total, item) => {
        if (item.oldPrice && item.oldPrice > item.price) {
          return total + (item.oldPrice - item.price) * item.quantity
        }
        return total
      }, 0),

    cashbackTotal: (state) =>
      state.items.reduce(
        (total, item) =>
          total + ((item.price * (item.cashback || 0)) / 100) * item.quantity,
        0
      ),

    total: (state) => {
      let subtotalWithAditionals = 0
      
      state.items.forEach(item => {
        let itemTotal = item.price * item.quantity
        
        if (item.aditionals && item.aditionals.length > 0) {
          item.aditionals.forEach(group => {
            group.items.forEach(aditional => {
              if (aditional.quantity > 0 && aditional.price) {
                itemTotal += (aditional.price * aditional.quantity) * item.quantity
              }
            })
          })
        }
        
        subtotalWithAditionals += itemTotal
      })
      
      const discount = state.items.reduce((total, item) => {
        if (item.oldPrice && item.oldPrice > item.price) {
          return total + (item.oldPrice - item.price) * item.quantity
        }
        return total
      }, 0)
      
      return subtotalWithAditionals - discount
    },
    
    getItemDetails: (state) => (itemId, selectedOption) => {
      const item = state.items.find(i => 
        i.id === itemId && i.selectedOption === selectedOption
      )
      
      if (!item) return null
      
      let basePrice = item.price
      let aditionalsTotal = 0
      let aditionalsList = []
      
      if (item.aditionals) {
        item.aditionals.forEach(group => {
          group.items.forEach(aditional => {
            if (aditional.quantity > 0) {
              const aditionalTotal = (aditional.price || 0) * aditional.quantity
              aditionalsTotal += aditionalTotal
              aditionalsList.push({
                name: aditional.name,
                quantity: aditional.quantity,
                price: aditional.price,
                total: aditionalTotal
              })
            }
          })
        })
      }
      
      return {
        ...item,
        basePrice,
        aditionalsTotal,
        aditionalsList,
        itemTotal: (basePrice + aditionalsTotal) * item.quantity
      }
    }
  },

  actions: {

    add(product) {
      const toast = useToast()

      // Gera um ID único para o item baseado nas personalizações
      const generateItemKey = (item) => {
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

      // CRIA UMA CÓPIA PROFUNDA DOS ADICIONAIS COM AS QUANTIDADES
      let aditionalsCopy = []
      if (product.aditionals && product.aditionals.length > 0) {
        aditionalsCopy = JSON.parse(JSON.stringify(product.aditionals))
      }

      // Adiciona o novo item
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
        customization: product.customization
      })

      toast.success(`"${product.name}" adicionado ao carrinho!`, { timeout: 3000 })
    },

    updateItem(product) {
      const toast = useToast()

      // Função para gerar chave única do item
      const generateItemKey = (item) => {
        return `${item.id}_${item.selectedOption || ''}_${item.selectedSize?.id || ''}_${JSON.stringify(item.selectedFlavors?.map(f => f.id) || [])}`
      }

      // Gera chave do item original
      const originalKey = `${product.id}_${product.originalSelectedOption || ''}_${product.originalSelectedSize?.id || ''}_${JSON.stringify(product.originalSelectedFlavors?.map(f => f.id) || [])}`
      
      // Encontra o item original
      const originalIndex = this.items.findIndex(item => generateItemKey(item) === originalKey)

      if (originalIndex === -1) return

      const originalItem = this.items[originalIndex]
      const originalQuantity = originalItem.quantity
      
      // Remove o original
      this.items.splice(originalIndex, 1)

      // Gera chave do novo item
      const newKey = generateItemKey({
        id: product.id,
        selectedOption: product.selectedOption,
        selectedSize: product.selectedSize,
        selectedFlavors: product.selectedFlavors
      })

      // Verifica se já existe com as novas opções
      const existingIndex = this.items.findIndex(item => generateItemKey(item) === newKey)

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
          customization: product.customization
        })
      }

      toast.success(`"${product.name}" atualizado!`, { timeout: 3000 })
    },

    increase(productId, selectedOption = null) {
      const toast = useToast()
      
      // Encontra o item pelo ID e opção selecionada
      const item = this.items.find(i => 
        i.id === productId && i.selectedOption === selectedOption
      )
      
      if (item) {
        item.quantity++
        toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, { timeout: 3000 })
      }
    },

    decrease(productId, selectedOption = null) {
      const toast = useToast()
      
      const item = this.items.find(i => 
        i.id === productId && i.selectedOption === selectedOption
      )
      
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
          toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, { timeout: 3000 })
        } else {
          this.remove(productId, selectedOption)
        }
      }
    },

    remove(productId, selectedOption = null) {
      const toast = useToast()
      
      const item = this.items.find(i => 
        i.id === productId && i.selectedOption === selectedOption
      )
      
      if (item) {
        this.items = this.items.filter(i => 
          !(i.id === productId && i.selectedOption === selectedOption)
        )
        toast.error(`"${item.name}" removido do carrinho!`, { timeout: 3000 })
      }
    },

    clear() {
      const toast = useToast()
      this.items = []
      toast.info('Carrinho esvaziado!', { timeout: 3000 })
    },
    
    calculateItemTotal(item) {
      let total = item.price * item.quantity
      
      if (item.aditionals && item.aditionals.length > 0) {
        item.aditionals.forEach(group => {
          group.items.forEach(aditional => {
            if (aditional.quantity > 0 && aditional.price) {
              total += (aditional.price * aditional.quantity) * item.quantity
            }
          })
        })
      }
      
      return total
    }
  }
})