import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  // ✅ Persistência
  persist: {
    key: 'cart',
    storage: localStorage,
    paths: ['items']
  },

getters: {
  totalItems: (state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),

  subTotal: (state) =>
    state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ),

  discount: (state) =>
    state.items.reduce((total, item) => {
      if (item.oldPrice && item.oldPrice > item.price) {
        return total + (item.oldPrice - item.price) * item.quantity
      }
      return total
    }, 0),

  // Cashback total (valor fixo por item)
  cashbackTotal: (state) =>
    state.items.reduce(
      (total, item) =>
        total + ((item.price * (item.cashback || 0)) / 100) * item.quantity,
      0
    ),

  // Total final = subtotal - desconto + cashback
  total: (state) => {
    const subtotal = state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const discount = state.items.reduce((total, item) => {
      if (item.oldPrice && item.oldPrice > item.price) {
        return total + (item.oldPrice - item.price) * item.quantity
      }
      return total
    }, 0)
    // const cashback = state.items.reduce(
    //   (total, item) =>
    //     total + ((item.price * (item.cashback || 0)) / 100) * item.quantity,
    //   0
    // )
    return subtotal - discount 
  }
},

  actions: {
    add(product) {
      const toast = useToast()
      const existing = this.items.find(i => i.id === product.id)

      if (existing) {
        existing.quantity++
        toast.info(`Mais 1 unidade de "${product.name}" adicionada!`, {
          timeout: 3000
        })
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          cashback: product.cashback || 0,
          quantity: 1
        })
  
        toast.success(`"${product.name}" adicionado ao carrinho!`, {
          timeout: 3000
        })
      }
    },

    increase(productId) {
      const toast = useToast()
      const item = this.items.find(i => i.id === productId)

      if (item) {
        item.quantity++
        toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, {
          timeout: 3000
        })
      }
    },

    decrease(productId) {
      const toast = useToast()
      const item = this.items.find(i => i.id === productId)

      if (!item) return

      if (item.quantity > 1) {
        item.quantity--
        toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, {
          timeout: 3000
        })
      } else {
        this.remove(productId)
      }
    },

    remove(productId) {
      const toast = useToast()
      const item = this.items.find(i => i.id === productId)

      if (!item) return

      this.items = this.items.filter(i => i.id !== productId)

      toast.error(`"${item.name}" removido do carrinho!`, {
        timeout: 3000
      })
    },

    clear() {
      const toast = useToast()

      if (this.items.length === 0) return

      this.items = []

      toast.info('Carrinho esvaziado!', {
        timeout: 3000
      })
    }
  }
})