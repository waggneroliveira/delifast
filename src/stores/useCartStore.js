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

    // =========================
    // SUBTOTAL COM ADICIONAIS
    // =========================
    subTotal: (state) =>
      state.items.reduce((total, item) => {
        // Calcula o preço base do produto
        let itemTotal = item.price * item.quantity
        
        // Soma o preço dos adicionais
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

    // =========================
    // DESCONTO (apenas produtos, adicionais não têm desconto)
    // =========================
    discount: (state) =>
      state.items.reduce((total, item) => {
        if (item.oldPrice && item.oldPrice > item.price) {
          return total + (item.oldPrice - item.price) * item.quantity
        }
        return total
      }, 0),

    // =========================
    // CASHBACK (apenas produtos, adicionais não dão cashback)
    // =========================
    cashbackTotal: (state) =>
      state.items.reduce(
        (total, item) =>
          total + ((item.price * (item.cashback || 0)) / 100) * item.quantity,
        0
      ),

    // =========================
    // TOTAL COM ADICIONAIS E DESCONTO
    // =========================
    total: (state) => {
      // Calcula subtotal com adicionais
      let subtotalWithAditionals = 0
      
      state.items.forEach(item => {
        // Preço base do produto
        let itemTotal = item.price * item.quantity
        
        // Adicionais
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
      
      // Calcula desconto (apenas nos produtos, não nos adicionais)
      const discount = state.items.reduce((total, item) => {
        if (item.oldPrice && item.oldPrice > item.price) {
          return total + (item.oldPrice - item.price) * item.quantity
        }
        return total
      }, 0)
      
      return subtotalWithAditionals - discount
    },
    
    // =========================
    // DETALHAMENTO DO ITEM (para exibir no carrinho)
    // =========================
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

    // =========================
    // ADD - COM ADICIONAIS
    // =========================
    add(product) {
      const toast = useToast()

      // Verifica se já existe
      const existing = this.items.find(i =>
        i.id === product.id &&
        i.selectedOption === product.selectedOption
      )

      if (existing) {
        existing.quantity++
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
        oldPrice: product.oldPrice,
        image: product.image,
        cashback: product.cashback || 0,
        quantity: 1,
        options: product.options || [],
        selectedOption: product.selectedOption || null,
        aditionals: aditionalsCopy
      })

      toast.success(`"${product.name}" adicionado ao carrinho!`, { timeout: 3000 })
    },

    // =========================
    // UPDATE ITEM - COM ADICIONAIS
    // =========================
    updateItem(product) {
      const toast = useToast()

      // Encontra o item original
      const index = this.items.findIndex(i =>
        i.id === product.id &&
        i.selectedOption === product.originalSelectedOption
      )

      if (index === -1) return

      const originalItem = this.items[index]
      
      // Remove o original
      this.items.splice(index, 1)

      // Verifica se já existe com a nova opção
      const existing = this.items.find(i =>
        i.id === product.id &&
        i.selectedOption === product.selectedOption
      )

      // CRIA UMA CÓPIA DOS ADICIONAIS ATUALIZADOS
      let updatedAditionals = []
      if (product.aditionals && product.aditionals.length > 0) {
        updatedAditionals = JSON.parse(JSON.stringify(product.aditionals))
      }

      if (existing) {
        existing.quantity++
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          cashback: product.cashback || 0,
          quantity: originalItem.quantity,
          options: product.options || [],
          selectedOption: product.selectedOption || null,
          aditionals: updatedAditionals
        })
      }

      toast.success(`"${product.name}" atualizado!`, { timeout: 3000 })
    },

    // =========================
    // INCREASE ITEM
    // =========================
    increase(productId, selectedOption = null) {
      const toast = useToast()
      const item = this.items.find(i => 
        i.id === productId && 
        i.selectedOption === selectedOption
      )
      
      if (item) {
        item.quantity++
        toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, { timeout: 3000 })
      }
    },

    // =========================
    // DECREASE ITEM
    // =========================
    decrease(productId, selectedOption = null) {
      const toast = useToast()
      const item = this.items.find(i => 
        i.id === productId && 
        i.selectedOption === selectedOption
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

    // =========================
    // REMOVE ITEM
    // =========================
    remove(productId, selectedOption = null) {
      const toast = useToast()
      const item = this.items.find(i => 
        i.id === productId && 
        i.selectedOption === selectedOption
      )
      
      if (item) {
        this.items = this.items.filter(i => 
          !(i.id === productId && i.selectedOption === selectedOption)
        )
        toast.error(`"${item.name}" removido do carrinho!`, { timeout: 3000 })
      }
    },

    // =========================
    // CLEAR CART
    // =========================
    clear() {
      const toast = useToast()
      this.items = []
      toast.info('Carrinho esvaziado!', { timeout: 3000 })
    },
    
    // =========================
    // CALCULAR TOTAL DE UM ITEM ESPECÍFICO
    // =========================
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