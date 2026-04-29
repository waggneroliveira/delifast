<template>
  <div class="mobile-bottom-menu d-md-none">
    <div class="menu-container">
      <button 
        v-for="item in items"
        :key="item.key"
        class="menu-item"
        :class="{ active: active === item.key }"
        @click="select(item)"
      >
        <i :class="item.icon"></i>
        <span v-if="active === item.key">
          {{ item.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['change', 'open-orders'])

const active = ref('orders')

const items = [
  { key: 'home', icon: 'bi bi-house', label: 'Início' },
  { key: 'orders', icon: 'bi bi-bag', label: 'Pedidos' },
  { key: 'search', icon: 'bi bi-search', label: 'Buscar' },
  { key: 'delivery', icon: 'bi bi-bicycle', label: 'Entrega' },
  { key: 'profile', icon: 'bi bi-person', label: 'Perfil' }
]

const select = (item) => {
  active.value = item.key
  
  if (item.key === 'orders') {
    emit('open-orders') // Evento específico para pedidos
  } else {
    emit('change', item.key) // Evento geral para outros itens
  }
}
</script>

<style scoped>
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