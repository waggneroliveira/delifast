import { defineStore } from 'pinia'

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
      const existing = this.items.find(i => i.id === product.id)

      if (existing) {
        existing.quantity++
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          quantity: 1
        })
      }
    },

    increase(productId) {
      const item = this.items.find(i => i.id === productId)
      if (item) item.quantity++
    },

    decrease(productId) {
      const item = this.items.find(i => i.id === productId)

      if (!item) return

      if (item.quantity > 1) {
        item.quantity--
      } else {
        this.remove(productId)
      }
    },

    remove(productId) {
      this.items = this.items.filter(i => i.id !== productId)
    },

    clear() {
      this.items = []
    }
  }
})