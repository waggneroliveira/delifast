<!-- components/OrderHistoryModal.vue -->
<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">📦 Meus Pedidos</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Carregando seus pedidos...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="orders.length === 0" class="empty-state">
          <span class="empty-emoji">🍕</span>
          <p>Você ainda não fez nenhum pedido</p>
          <small>Seus pedidos aparecerão aqui quando você fizer sua primeira compra!</small>
        </div>

        <!-- Orders list -->
        <div v-else class="orders-list">
          <div 
            v-for="order in orders" 
            :key="order.id" 
            class="order-card"
            :class="{ 'order-expanded': expandedOrder === order.id }"
          >
            <div class="order-header" @click="toggleOrderDetails(order.id)">
              <div class="order-info">
                <div class="order-id">Pedido #{{ order.id }}</div>
                <div class="order-date">{{ formatDate(order.createdAt) }}</div>
              </div>
              <div class="order-status">
                <span :class="['status-badge', getStatusClass(order.status)]">
                  {{ getStatusText(order.status) }}
                </span>
                <span class="expand-icon">{{ expandedOrder === order.id ? '▼' : '▶' }}</span>
              </div>
            </div>

            <div v-if="expandedOrder === order.id" class="order-details">
              <div class="order-summary">
                <div class="summary-item">
                  <strong>Total:</strong> 
                  <span class="order-total">{{ formatCurrency(order.total) }}</span>
                </div>
                <div class="summary-item">
                  <strong>Forma de pagamento:</strong> 
                  {{ getPaymentMethodText(order.paymentMethod) }}
                </div>
                <div class="summary-item" v-if="order.deliveryAddress">
                  <strong>Endereço de entrega:</strong> 
                  {{ formatAddress(order.deliveryAddress) }}
                </div>
              </div>

              <!-- Itens do pedido -->
              <div class="order-items">
                <div class="items-title">📋 Itens do pedido:</div>
                <div class="items-list">
                  <div v-for="(item, itemIdx) in order.items" :key="itemIdx" class="order-item">
                    <img 
                      v-if="item.image" 
                      :src="item.image" 
                      :alt="item.name"
                      class="item-image"
                    >
                    <div class="item-info">
                      <div class="item-name">{{ item.name }}</div>
                      <div class="item-quantity">Qtd: {{ item.quantity }}</div>
                    </div>
                    <div class="item-price">{{ formatCurrency(item.finalPrice || item.price) }}</div>
                  </div>
                </div>
              </div>

              <!-- Exibir customizações se houver -->
              <div class="order-customizations" v-if="hasCustomizations(order)">
                <div class="customizations-title">✨ Detalhes adicionais:</div>
                <div class="customizations-list">
                  <div v-for="(item, idx) in order.items" :key="idx" class="customization-item">
                    <div class="customization-item-name">{{ item.name }}</div>
                    <div v-if="item.customization" class="customization-details">
                      <div v-if="item.customization.size">📏 Tamanho: {{ item.customization.size }}</div>
                      <div v-if="item.customization.flavors && item.customization.flavors.length">🍕 Sabores: {{ item.customization.flavors.join(', ') }}</div>
                      <div v-if="item.customization.toppings && item.customization.toppings.length">➕ Adicionais: {{ item.customization.toppings.join(', ') }}</div>
                      <div v-if="item.customization.spiciness">🌶️ Picância: {{ item.customization.spiciness }}</div>
                    </div>
                    <div v-if="item.comboDetails" class="combo-details">
                      <div class="combo-title">📦 Itens do combo:</div>
                      <div v-if="item.comboDetails.hamburguer">🍔 Hambúrguer: {{ item.comboDetails.hamburguer }}</div>
                      <div v-if="item.comboDetails.acompanhamento">🍟 Acompanhamento: {{ item.comboDetails.acompanhamento }}</div>
                      <div v-if="item.comboDetails.bebida">🥤 Bebida: {{ item.comboDetails.bebida }}</div>
                      <div v-if="item.comboDetails.yakisoba">🍜 Yakisoba: {{ item.comboDetails.yakisoba }}</div>
                      <div v-if="item.comboDetails.refrigerante">🥤 Refrigerante: {{ item.comboDetails.refrigerante }}</div>
                      <div v-if="item.comboDetails.rolinhos && item.comboDetails.rolinhos.length">🥟 Rolinhos: {{ item.comboDetails.rolinhos.join(', ') }}</div>
                      <div v-if="item.comboDetails.pizza && item.comboDetails.pizza.length">🍕 Pizza: {{ item.comboDetails.pizza.join(', ') }}</div>
                      <div v-if="item.comboDetails.borda">🍕 Borda: {{ item.comboDetails.borda }}</div>
                      <div v-if="item.comboDetails.sobremesa">🍰 Sobremesa: {{ item.comboDetails.sobremesa }}</div>
                      <div v-if="item.comboDetails.extras && item.comboDetails.extras.length">✨ Extras: {{ item.comboDetails.extras.join(', ') }}</div>
                    </div>
                    <!-- Exibir seleções do combo diretamente -->
                    <div v-if="item.itemSelections && !item.comboDetails" class="combo-details">
                      <div class="combo-title">📦 Itens do combo:</div>
                      <div v-if="item.itemSelections.hamburguer">🍔 Hambúrguer: {{ item.itemSelections.hamburguer.choice?.name }}</div>
                      <div v-if="item.itemSelections.acompanhamento">🍟 Acompanhamento: {{ item.itemSelections.acompanhamento.choice?.name }}</div>
                      <div v-if="item.itemSelections.bebida">🥤 Bebida: {{ item.itemSelections.bebida.choice?.name }}</div>
                      <div v-if="item.itemSelections.yakisoba">🍜 Yakisoba: {{ item.itemSelections.yakisoba.choice?.name }}</div>
                      <div v-if="item.itemSelections.refrigerante">🥤 Refrigerante: {{ item.itemSelections.refrigerante.choice?.name }}</div>
                      <div v-if="item.itemSelections.rolinhos && item.itemSelections.rolinhos.length">🥟 Rolinhos: {{ item.itemSelections.rolinhos.map(r => r.choice?.name).join(', ') }}</div>
                    </div>
                    <div v-if="item.selectedAddons && item.selectedAddons.length" class="customization-details">
                      <div>➕ Adicionais: {{ item.selectedAddons.map(a => `${a.name} (${a.quantity}x)`).join(', ') }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="order-actions" v-if="order.status === 'delivered'">
                <button class="btn-reorder" @click="reorder(order)">
                  🔄 Pedir novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close-modal" @click="closeModal">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  userId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'reorder'])

const loading = ref(false)
const orders = ref([])
const expandedOrder = ref(null)

// Função para verificar se o pedido tem customizações
const hasCustomizations = (order) => {
  if (!order || !order.items) return false
  return order.items.some(item => item.customization || item.comboDetails || item.itemSelections)
}

// Fetch orders
const fetchOrders = async () => {
  if (!props.userId) {
    console.warn('UserId não fornecido para buscar pedidos')
    orders.value = []
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Usando dados mock com estrutura completa para combo
    console.log(`📦 Buscando pedidos para o usuário ${props.userId}`)
    orders.value = getMockOrders()
    
  } catch (error) {
    console.error('Error fetching orders:', error)
    orders.value = getMockOrders()
  } finally {
    loading.value = false
  }
}

// Mock data com estrutura completa e corrigida para combo
const getMockOrders = () => {
  return [
    {
      id: 1001,
      userId: 1234567890,
      createdAt: new Date(2024, 2, 15, 19, 30),
      total: 109.90,
      status: 'delivered',
      paymentMethod: 'credit_card',
      deliveryAddress: {
        street: 'Rua das Flores, 123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        number: '123',
        complement: 'Apto 45'
      },
      items: [
        { 
          id: 1,
          productId: 1,
          name: 'Hambúrguer Clássico',
          quantity: 1,
          price: 109.90,
          finalPrice: 109.90,
          originalPrice: 109.90,
          oldPrice: 119.90,
          image: '../src/assets/images/prod.png',
          cashback: 5,
          isCombo: false,
          description: '4 smash burgers com 400g de fritas, creme de cheddar com bacon + Refrigerante',
          aditionals: [
            {
              title: 'Adicionais',
              items: [
                { id: 1, name: 'Queijo Extra', price: 3.50, quantity: 1, stock: 99 },
                { id: 2, name: 'Bacon Extra', price: 4.00, quantity: 1, stock: 99 }
              ]
            }
          ],
          aditionalsState: { 1: 1, 2: 1 },
          selectedSize: null,
          selectedFlavors: [],
          customization: {
            toppings: ['Queijo Extra', 'Bacon Extra'],
            spiciness: 'Médio'
          }
        }
      ]
    },
    {
      id: 1002,
      userId: 1234567890,
      createdAt: new Date(2024, 2, 10, 20, 15),
      total: 67.50,
      status: 'delivered',
      paymentMethod: 'pix',
      deliveryAddress: {
        street: 'Av. Paulista, 1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        number: '1000',
        complement: 'Sala 1234'
      },
      items: [
        { 
          id: 8,
          productId: 8,
          name: 'Combo Burger',
          quantity: 1,
          price: 39.90,
          finalPrice: 53.90,
          basePrice: 39.90,
          oldPrice: 59.90,
          image: '../src/assets/images/prod.png',
          cashback: 5,
          isCombo: true,
          description: 'Hambúrguer + Acompanhamento + Bebida',
          savings: 20.00,
          
          // Estrutura do combo (definições)
          comboItems: [
            {
              id: 'hamburguer',
              name: 'Hambúrguer Artesanal',
              quantity: 1,
              required: true,
              price: 0,
              options: null
            },
            {
              id: 'acompanhamento',
              name: 'Acompanhamento',
              quantity: 1,
              required: true,
              options: {
                type: 'select',
                title: 'Escolha o acompanhamento',
                required: true,
                maxSelections: 1,
                choices: [
                  { id: 1, name: 'Batata Frita', price: 0, default: true },
                  { id: 2, name: 'Batata Rústica', price: 0 },
                  { id: 3, name: 'Onion Rings', price: 3.00 },
                  { id: 4, name: 'Salada', price: 0 }
                ]
              }
            },
            {
              id: 'bebida',
              name: 'Bebida',
              quantity: 1,
              required: true,
              options: {
                type: 'select',
                title: 'Escolha a bebida',
                required: true,
                maxSelections: 1,
                choices: [
                  { id: 1, name: 'Coca-Cola 350ml', price: 0 },
                  { id: 2, name: 'Guaraná 350ml', price: 0 },
                  { id: 3, name: 'Suco Natural', price: 3.00 },
                  { id: 4, name: 'Água', price: 0 }
                ]
              }
            }
          ],
          
          // Adicionais disponíveis para o combo
          comboAddons: [
            { id: 1, name: 'Queijo Extra', price: 3.00, maxQuantity: 2 },
            { id: 2, name: 'Bacon Extra', price: 4.00, maxQuantity: 2 }
          ],
          
          // Seleções salvas do combo
          itemSelections: {
            acompanhamento: { 
              choice: { id: 1, name: 'Batata Frita', price: 0 }, 
              quantity: 1, 
              price: 0 
            },
            bebida: { 
              choice: { id: 1, name: 'Coca-Cola 350ml', price: 0 }, 
              quantity: 1, 
              price: 0 
            }
          },
          
          // Adicionais selecionados
          selectedAddons: [
            { id: 1, name: 'Queijo Extra', price: 3.00, quantity: 1 }
          ],
          
          addonsTotalPrice: 3.00,
          hasComboSelection: true,
          isComboItem: true,
          
          // Para exibição no histórico
          comboDetails: {
            hamburguer: 'Hambúrguer Artesanal',
            acompanhamento: 'Batata Frita',
            bebida: 'Coca-Cola 350ml',
            extras: ['Queijo Extra']
          }
        }
      ]
    },
    {
      id: 1003,
      userId: 1234567890,
      createdAt: new Date(2024, 2, 5, 18, 45),
      total: 45.90,
      status: 'delivered',
      paymentMethod: 'debit_card',
      deliveryAddress: {
        street: 'Rua Augusta, 500',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        number: '500',
        complement: ''
      },
      items: [
        { 
          id: 2,
          productId: 2,
          name: 'Pizza Portuguesa',
          quantity: 1,
          price: 45.90,
          finalPrice: 45.90,
          originalPrice: 45.90,
          oldPrice: 55.90,
          image: '../src/assets/images/prod.png',
          cashback: 8,
          isCombo: false,
          description: 'Molho especial, presunto, ovos, cebola, azeitona e queijo mussarela',
          selectedSize: { id: 2, name: 'M', price: 45.90, description: '6 fatias - 3 pessoas', oldPrice: 55.90 },
          selectedFlavors: [{ id: 1, name: 'Portuguesa', price: 0, description: 'Presunto, ovo, cebola, azeitona' }],
          aditionals: [
            {
              title: 'Adicionais',
              items: [
                { id: 7, name: 'Azeitona Extra', price: 2.00, quantity: 1, stock: 99 }
              ]
            }
          ],
          aditionalsState: { 7: 1 },
          customization: {
            size: 'M',
            flavors: ['Portuguesa'],
            toppings: ['Azeitona Extra']
          }
        }
      ]
    }
  ]
}

const closeModal = () => {
  emit('update:modelValue', false)
  expandedOrder.value = null
}

const toggleOrderDetails = (orderId) => {
  expandedOrder.value = expandedOrder.value === orderId ? null : orderId
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatAddress = (address) => {
  if (!address) return 'Endereço não informado'
  let addressStr = `${address.street}, ${address.number}`
  if (address.complement) addressStr += ` - ${address.complement}`
  addressStr += ` - ${address.neighborhood}, ${address.city}`
  return addressStr
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '⏳ Pendente',
    confirmed: '✅ Confirmado',
    preparing: '👨‍🍳 Preparando',
    out_for_delivery: '🚚 Saiu para entrega',
    delivered: '📦 Entregue',
    cancelled: '❌ Cancelado'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    preparing: 'status-preparing',
    out_for_delivery: 'status-out-for-delivery',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || 'status-pending'
}

const getPaymentMethodText = (method) => {
  const methodMap = {
    credit_card: '💳 Cartão de Crédito',
    debit_card: '💳 Cartão de Débito',
    pix: '📱 PIX',
    cash: '💵 Dinheiro',
    meal_voucher: '🍽️ Vale Refeição',
    gift_card: '🎁 Vale Presente'
  }
  return methodMap[method] || method
}

const reorder = (order) => {
  console.log('📦 Emitindo reorder para:', order)
  emit('reorder', order)
  closeModal()
}

// Fetch orders when modal opens
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.userId) {
    fetchOrders()
  }
})
</script>

<style scoped>
/* Seu CSS existente permanece o mesmo */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-emoji {
  font-size: 4rem;
  display: block;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 8px;
}

.empty-state small {
  color: #9ca3af;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  padding: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.order-info {
  flex: 1;
}

.order-id {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.order-date {
  font-size: 0.85rem;
  color: #6b7280;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-pending { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #dbeafe; color: #1e40af; }
.status-preparing { background: #fed7aa; color: #9a3412; }
.status-out-for-delivery { background: #c7d2fe; color: #3730a3; }
.status-delivered { background: #d1fae5; color: #065f46; }
.status-cancelled { background: #fee2e2; color: #991b1b; }

.expand-icon {
  font-size: 12px;
  color: #6b7280;
}

.order-details {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.order-summary {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.summary-item {
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.order-total {
  color: #dc2626;
  font-weight: 600;
  font-size: 1.1rem;
}

.items-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #374151;
  font-size: 1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  background: #f3f4f6;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
}

.item-quantity {
  font-size: 0.8rem;
  color: #6b7280;
}

.item-price {
  font-weight: 500;
  color: #1f2937;
}

.order-customizations {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}

.customizations-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.95rem;
  color: #374151;
}

.customizations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customization-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}

.customization-item-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e5e7eb;
}

.customization-details,
.combo-details {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 3px solid #dc2626;
  font-size: 0.85rem;
  color: #4b5563;
}

.customization-details div,
.combo-details div {
  margin-top: 6px;
}

.combo-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #dc2626;
}

.order-actions {
  margin-top: 16px;
  text-align: center;
}

.btn-reorder {
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-reorder:hover {
  background: #b91c1c;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  background: #6b7280;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close-modal:hover {
  background: #4b5563;
}
</style>