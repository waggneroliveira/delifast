// useCartStore.js - versão corrigida mantendo sua estrutura

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

    cashbackTotal: (state) =>
      state.items.reduce(
        (total, item) =>
          total + ((item.price * (item.cashback || 0)) / 100) * item.quantity,
        0
      ),

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

      return subtotal - discount
    }
  },

  actions: {

    // =========================
    // ADD - VERSÃO SIMPLIFICADA QUE FUNCIONA
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

      // 🔥 CRIA UMA CÓPIA PROFUNDA DOS ADICIONAIS COM AS QUANTIDADES
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
        aditionals: aditionalsCopy  // 🔥 Salva os adicionais como estão
      })

      toast.success(`"${product.name}" adicionado ao carrinho!`, { timeout: 3000 })
    },

    // =========================
    // UPDATE ITEM - VERSÃO SIMPLIFICADA
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

      // 🔥 CRIA UMA CÓPIA DOS ADICIONAIS ATUALIZADOS
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
          aditionals: updatedAditionals  // 🔥 Salva os adicionais atualizados
        })
      }

      toast.success(`"${product.name}" atualizado!`, { timeout: 3000 })
    },

    // =========================
    // INCREASE ITEM
    // =========================
    increase(productId) {
      const toast = useToast()
      const item = this.items.find(i => i.id === productId)
      if (item) {
        item.quantity++
        toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, { timeout: 3000 })
      }
    },

    // =========================
    // DECREASE ITEM
    // =========================
    decrease(productId) {
      const toast = useToast()
      const item = this.items.find(i => i.id === productId)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
          toast.info(`Quantidade de "${item.name}" agora é ${item.quantity}`, { timeout: 3000 })
        } else {
          this.remove(productId)
        }
      }
    },

    // =========================
    // REMOVE ITEM
    // =========================
    remove(productId) {
      const toast = useToast()
      const item = this.items.find(i => i.id === productId)
      if (item) {
        this.items = this.items.filter(i => i.id !== productId)
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
    }
  }
})