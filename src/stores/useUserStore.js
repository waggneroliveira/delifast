import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    fullName: '',
    whatsapp: '',
    isLogged: false
  }),

  getters: {
    userInfo: (state) => ({
      fullName: state.fullName,
      whatsapp: state.whatsapp
    })
  },

  actions: {
    login(userData) {
      this.fullName = userData.fullName
      this.whatsapp = userData.whatsapp
      this.isLogged = true
      
      // Salvar no localStorage
      localStorage.setItem('userData', JSON.stringify({
        fullName: userData.fullName,
        whatsapp: userData.whatsapp
      }))
    },

    logout() {
      this.fullName = ''
      this.whatsapp = ''
      this.isLogged = false
      
      // Remover do localStorage
      localStorage.removeItem('userData')
    },

    loadUserFromStorage() {
      const saved = localStorage.getItem('userData')
      if (saved) {
        const data = JSON.parse(saved)
        this.fullName = data.fullName
        this.whatsapp = data.whatsapp
        this.isLogged = true
      }
    }
  },

  persist: {
    key: 'user',
    storage: localStorage,
    paths: ['fullName', 'whatsapp', 'isLogged']
  }
})