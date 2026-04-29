<template>
  <div class="mobile-bottom-menu d-md-none">
    <div class="menu-container">
      <button 
        v-for="item in items"
        :key="item.key"
        class="menu-item"
        :class="{ active: active === item.key }"
        @click="handleClick(item)"
        :data-bs-toggle="item.key === 'delivery' ? 'offcanvas' : null"
        :data-bs-target="item.key === 'delivery' ? '#cartCanvas' : null"
      >
        <div class="position-relative">
          <i :class="item.icon"></i>

          <!-- Badge do carrinho -->
          <span 
            v-if="item.key === 'delivery' && cartCount > 0"
            class="cart-badge"
          >
            {{ cartCount > 9 ? '9+' : cartCount }}
          </span>
        </div>

        <span v-if="active === item.key">
          {{ item.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/useCartStore'

const emit = defineEmits(['change', 'open-orders'])

const cart = useCartStore()

const active = ref('orders')
const isOpeningCart = ref(false)

const items = [
  { key: 'home', icon: 'bi bi-house', label: 'Início' },
  { key: 'orders', icon: 'bi bi-bag', label: 'Pedidos' },
  { key: 'search', icon: 'bi bi-search', label: 'Buscar' },
  { key: 'delivery', icon: 'bi bi-cart3', label: 'Carrinho' },
  { key: 'profile', icon: 'bi bi-person', label: 'Perfil' }
]

// total de itens no carrinho
const cartCount = computed(() => {
  return cart.items.reduce((total, item) => {
    return total + (item.quantity || 1)
  }, 0)
})

// Função para rolar suavemente para o topo
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// clique geral
const handleClick = (item) => {
  if (item.key === 'delivery') {
    openCart()
    return
  }

  select(item)
  
  // Rola para o topo APENAS quando clicar em 'home' (Início)
  if (item.key === 'home') {
    scrollToTop()
  }
}

// abrir carrinho (controlado via JS)
const openCart = () => {
  // evita clique duplicado
  if (isOpeningCart.value) return

  isOpeningCart.value = true

  // vibração (mobile)
  if (navigator.vibrate) {
    navigator.vibrate(30)
  }

  // ativa o menu
  active.value = 'delivery'

  // abre offcanvas via Bootstrap API
  const el = document.getElementById('cartCanvas')
  if (el && window.bootstrap) {
    const offcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(el)
    offcanvas.show()
  }

  // libera clique depois
  setTimeout(() => {
    isOpeningCart.value = false
  }, 300)
}

// navegação padrão
const select = (item) => {
  active.value = item.key
  
  if (item.key === 'orders') {
    emit('open-orders')
  } else {
    emit('change', item.key)
  }
}
</script>

<style scoped>
.cart-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #ff3b30;
  color: #fff;
  font-size: 0.65rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 50px;
  line-height: 1;
}
.mobile-bottom-menu {
  position: fixed;
  bottom: 10px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 999;
}

.menu-container {
  background: #A4268E;
  padding: 6px;
  border-radius: 40px;
  display: flex;
  gap: 6px;
}

.menu-item {
    all: unset;
    cursor: pointer;
    color: #fff;
    width: 47px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.menu-item.active {
    background: #fff;
    color: #000;
    padding: 0 30px;
    border-radius: 30px;
    gap: 6px;
    transition: all 0.3s ease;
}

.menu-item span {
  font-size: 0.8rem;
  white-space: nowrap;
}

.menu-item i {
  font-size: 1.2rem;
}
</style>