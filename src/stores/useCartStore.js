import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

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

    total: (state) =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
  },

  actions: {
    add(product) {
      const toast = useToast()
      const existing = this.items.find(i => i.id === product.id)

      if (existing) {
        existing.quantity++
        toast.info(`Mais 1 unidade de "${product.name}" adicionada ao carrinho!`, {
          timeout: 3000
        })
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
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
        toast.info(`Quantidade de "${item.name}" aumentada para ${item.quantity}`, {
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
        toast.info(`Quantidade de "${item.name}" reduzida para ${item.quantity}`, {
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