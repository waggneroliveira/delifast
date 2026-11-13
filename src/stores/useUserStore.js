// stores/useUserStore.js
import { defineStore } from 'pinia'
import { clientApi, clearClientToken, getClientToken } from '@/services/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,           // ID único do usuário
    fullName: '',       // Nome completo
    whatsapp: '',       // WhatsApp para contato
    email: '',          // Email (opcional, para futuro)
    pathImage: '',
    isLogged: false     // Status de login
  }),

  getters: {
    // Getter para o ID (consistência)
    userId: (state) => state.id,
    
    // Informações completas do usuário
    userInfo: (state) => ({
      id: state.id,
      fullName: state.fullName,
      whatsapp: state.whatsapp,
      email: state.email,
      pathImage: state.pathImage
    }),
    
    // Nome de exibição (primeiro nome)
    displayName: (state) => {
      if (!state.fullName) return 'Usuário'
      return state.fullName.split(' ')[0]
    }
  },

  actions: {
    // Login do usuário
    login(userData) {
      // Garantir que tenha um ID (se não veio, gerar temporário)
      this.id = userData.id || Date.now()
      this.fullName = userData.fullName || ''
      this.whatsapp = userData.whatsapp || ''
      this.email = userData.email || ''
      this.pathImage = userData.pathImage || userData.path_image || ''
      this.isLogged = true
      
      // Salvar no localStorage para persistência
      this.saveToStorage()
      
      console.log('✅ Usuário logado:', {
        id: this.id,
        fullName: this.fullName,
        whatsapp: this.whatsapp
      })
    },

    // Atualizar dados do usuário
    updateUser(userData) {
      if (Object.prototype.hasOwnProperty.call(userData, 'id')) this.id = userData.id
      if (Object.prototype.hasOwnProperty.call(userData, 'fullName')) this.fullName = userData.fullName || ''
      if (Object.prototype.hasOwnProperty.call(userData, 'whatsapp')) this.whatsapp = userData.whatsapp || ''
      if (Object.prototype.hasOwnProperty.call(userData, 'email')) this.email = userData.email || ''
      if (Object.prototype.hasOwnProperty.call(userData, 'pathImage')) this.pathImage = userData.pathImage || ''
      if (Object.prototype.hasOwnProperty.call(userData, 'path_image')) this.pathImage = userData.path_image || ''
      
      this.saveToStorage()
      console.log('📝 Dados do usuário atualizados:', userData)
    },

    // Logout
    logout() {
      const logoutRequest = getClientToken()
        ? clientApi.logout().catch((error) => {
            console.error('Erro ao encerrar sessão na API:', error)
            return null
          })
        : Promise.resolve(null)

      this.id = null
      this.fullName = ''
      this.whatsapp = ''
      this.email = ''
      this.pathImage = ''
      this.isLogged = false
      clearClientToken()
      
      // Remover do localStorage
      localStorage.removeItem('userData')
      console.log('👋 Usuário deslogado')
      return logoutRequest
    },

    // Salvar no localStorage
    saveToStorage() {
      localStorage.setItem('userData', JSON.stringify({
        id: this.id,
        fullName: this.fullName,
        whatsapp: this.whatsapp,
        email: this.email,
        pathImage: this.pathImage
      }))
    },

    // Carregar do localStorage ao iniciar
    loadUserFromStorage() {
      const saved = localStorage.getItem('userData')
      if (!getClientToken()) {
        if (saved || this.isLogged) this.logout()
        return
      }

      if (saved) {
        try {
          const data = JSON.parse(saved)
          this.id = data.id
          this.fullName = data.fullName || ''
          this.whatsapp = data.whatsapp || ''
          this.email = data.email || ''
          this.pathImage = data.pathImage || data.path_image || ''
          this.isLogged = true
          console.log('📦 Usuário carregado do storage:', {
            id: this.id,
            fullName: this.fullName
          })
        } catch (error) {
          console.error('Erro ao carregar usuário:', error)
          this.logout()
        }
      }
    },

    // Método para sincronizar com backend (quando estiver pronto)
    async syncWithBackend() {
      if (!this.id) return null
      
      try {
        // Exemplo de chamada para o backend
        // const response = await fetch(`/api/users/${this.id}`)
        // const userData = await response.json()
        // this.updateUser(userData)
        // return userData
        
        console.log('🔄 Sincronização com backend - implementar quando API estiver pronta')
        return null
      } catch (error) {
        console.error('Erro ao sincronizar com backend:', error)
        return null
      }
    }
  },

  // Configuração de persistência
  persist: {
    key: 'user',
    storage: localStorage,
    paths: ['id', 'fullName', 'whatsapp', 'email', 'pathImage', 'isLogged']
  }
})