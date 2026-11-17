<!-- components/OrderHistoryModal.vue -->
<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-bag me-2"></i>Meus Pedidos
        </h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>

      <div class="modal-body">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Carregando seus pedidos...</p>
        </div>

        <div v-else-if="loadError" class="empty-state">
          <p>{{ loadError }}</p>
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
                <div class="order-id">Pedido #{{ order.number }}</div>
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
              <div v-if="loadingOrderId === order.id" class="text-muted p-2">
                Carregando detalhes do pedido...
              </div>
              <template v-else>
              <div class="order-summary">
                <div class="summary-item 1">
                  <strong>Total:</strong> 
                  <span class="ms-2 order-total">{{ formatCurrency(order.total) }}</span>
                </div>
                <div class="summary-item mb-1">
                  <strong>Forma de pagamento:</strong> 
                  {{ getPaymentMethodText(order.paymentMethod) }}
                </div>
                <div class="summary-item mb-1" v-if="order.deliveryAddress">
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
                <div class="customizations-title">✨ Personalizações do item:</div>
                <div class="customizations-list">
                  <div v-for="(item, idx) in order.items" :key="idx" class="customization-item">
                    <template v-if="hasItemCustomizations(item)">
                      <div class="customization-item-name">{{ item.name }}</div>
                      <div v-for="(line, lineIdx) in getProductDetailsLines(item)" :key="`detail-${lineIdx}`" class="customization-details">
                        {{ line }}
                      </div>
                      <div v-if="getComboSelectionRows(item).length" class="combo-details">
                        <div class="combo-title">📦 Itens do combo:</div>
                        <div v-for="selection in getComboSelectionRows(item)" :key="selection.id">
                          {{ selection.name }}: {{ selection.value }}
                        </div>
                      </div>
                      <div v-if="getSelectedComboAddons(item).length" class="customization-details">
                        ➕ Adicionais:
                        {{ getSelectedComboAddons(item).map(addon => `${addon.quantity}x ${addon.name}`).join(', ') }}
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <div class="order-actions" v-if="order.status === 'delivered'">
                <button class="btn-reorder" @click="reorder(order)">
                  🔄 Pedir novamente
                </button>
              </div>
              </template>
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
import { useToast } from 'vue-toastification'
import { getOrder, getOrders } from '@/services/api'

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

const toast = useToast()
const loading = ref(false)
const loadError = ref('')
const orders = ref([])
const expandedOrder = ref(null)
const loadingOrderId = ref(null)

//Em produção, substituir essa porta fixa por uma variável de ambiente.
const getProductImageUrl = (path) => {
  if (!path) return null

  if (/^https?:\/\//i.test(path)) return path

  const baseUrl = `${window.location.protocol}//${window.location.hostname}:8000`

  return `${baseUrl}/storage/${path.replace(/^\/+/, '')}`
}

const normalizeOrder = (order) => ({
  ...order,
  createdAt: order.createdAt ?? order.created_at,
  paymentMethod: order.paymentMethod ?? order.payment_method,
  deliveryAddress: order.deliveryAddress ?? order.delivery_address ?? order.address,
  total: order.total ?? order.total_amount ?? 0,
  items: (Array.isArray(order.items) ? order.items : []).map((item) => {
    const details = item.details && typeof item.details === 'object' ? item.details : {}

    return {
      ...details,
      ...item,
      name: item.name ?? item.product_title ?? details.name,
      price: item.unit_price ?? item.price ?? details.price,
      finalPrice: item.total_price ?? item.finalPrice ?? details.finalPrice,
      image: getProductImageUrl(
        item.image ?? item.product_image ?? details.image
      )
    }
  })
})

const getSelectedOptionGroups = (item) => {
  const selections = item.selectedOptions && typeof item.selectedOptions === 'object'
    ? item.selectedOptions
    : {}
  const hasSelections = Object.keys(selections).length > 0

  return (item.options || []).flatMap((group, index) => {
    const key = String(group.id ?? group.title ?? index)
    let selection = selections[key]
    if (
      selection === undefined
      && !hasSelections
      && item.selectedOption !== null
      && item.selectedOption !== undefined
      && group.items?.some((choice) => String(choice.id) === String(item.selectedOption))
    ) {
      selection = item.selectedOption
    }

    const selectedIds = Array.isArray(selection) ? selection : [selection]
    const choices = selectedIds
      .filter((id) => id !== undefined && id !== null)
      .map((id) => group.items?.find((choice) => String(choice.id) === String(id)))
      .filter(Boolean)

    return choices.length ? [{ group, choices }] : []
  })
}

const getProductDetailsLines = (item) => {
  const lines = []
  const optionGroups = getSelectedOptionGroups(item)
  const size = typeof item.selectedSize === 'string'
    ? item.selectedSize
    : item.selectedSize?.name
    ?? item.selectedSize?.title
    ?? item.customization?.size

  if (size) lines.push(`📏 Tamanho: ${size}`)

  for (const { group, choices } of optionGroups) {
    if (size && (group.isSizeOption || group.priceMode === 'replace')) continue
    lines.push(`${group.title || group.name}: ${choices.map((choice) => choice.name).join(', ')}`)
  }

  const flavors = (item.selectedFlavors || [])
    .map((flavor) => typeof flavor === 'string' ? flavor : flavor?.name ?? flavor?.title)
    .filter(Boolean)
  if (flavors.length) {
    lines.push(`🍕 Sabores: ${flavors.join(', ')}`)
  } else if (Array.isArray(item.customization?.flavors)
    && item.customization.flavors.every((flavor) => typeof flavor === 'string')
    && item.customization.flavors.length) {
    lines.push(`🍕 Sabores: ${item.customization.flavors.join(', ')}`)
  }

  const additionals = (item.aditionals || item.additionals || [])
    .flatMap((group) => group.items || [])
    .filter((additional) => Number(additional.quantity) > 0)
    .map((additional) => `${additional.quantity}x ${additional.name}`)
  if (additionals.length) {
    lines.push(`➕ Adicionais: ${additionals.join(', ')}`)
  } else if (Array.isArray(item.customization?.toppings)
    && item.customization.toppings.every((topping) => typeof topping === 'string')
    && item.customization.toppings.length) {
    lines.push(`➕ Adicionais: ${item.customization.toppings.join(', ')}`)
  }

  if (item.customization?.spiciness) {
    lines.push(`🌶️ Picância: ${item.customization.spiciness}`)
  }

  return lines
}

const getComboSelectionRows = (item) => {
  if (
    item.itemSelections
    && typeof item.itemSelections === 'object'
    && Object.keys(item.itemSelections).length
  ) {
    return Object.entries(item.itemSelections).flatMap(([id, selection]) => {
      const comboItem = (item.comboItems || []).find(
        (candidate) => String(candidate.id) === String(id),
      )
      const value = (Array.isArray(selection) ? selection : [selection])
        .map((choice) => {
          const name = choice?.choice?.name
            ?? choice?.selected?.name
            ?? choice?.selected
            ?? choice?.name
          if (!name) return null
          const quantity = Number(choice.quantity) || 1
          return quantity > 1 ? `${quantity}x ${name}` : name
        })
        .filter(Boolean)
        .join(', ')

      return value ? [{
        id,
        name: comboItem?.name ?? comboItem?.title ?? id,
        value
      }] : []
    })
  }

  if (!item.comboDetails || typeof item.comboDetails !== 'object') return []

  return Object.entries(item.comboDetails).flatMap(([id, value]) => {
    const formattedValue = Array.isArray(value)
      ? value.map((entry) => typeof entry === 'string' ? entry : entry?.name).filter(Boolean).join(', ')
      : typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : ''
    return formattedValue ? [{ id, name: id, value: formattedValue }] : []
  })
}

const getSelectedComboAddons = (item) => (item.selectedAddons || [])
  .filter((addon) => Number(addon.quantity) > 0 && addon.name)

const hasItemCustomizations = (item) => (
  getProductDetailsLines(item).length > 0
  || getComboSelectionRows(item).length > 0
  || getSelectedComboAddons(item).length > 0
)

const hasCustomizations = (order) => (
  (order?.items || []).some(hasItemCustomizations)
)

const fetchOrders = async () => {
  if (!props.userId) {
    orders.value = []
    return
  }
  
  loading.value = true
  loadError.value = ''
  
  try {
    orders.value = (await getOrders()).map(normalizeOrder)
  } catch (error) {
    console.error('Não foi possível carregar os pedidos da API.', error)
    loadError.value = error.response?.data?.message || 'Não foi possível carregar seus pedidos.'
    toast.error(loadError.value)
  } finally {
    loading.value = false
  }
}

watch([() => props.modelValue, () => props.userId], ([isOpen]) => {
  if (isOpen) {
    fetchOrders()
  }
}, { immediate: true })

const closeModal = () => {
  emit('update:modelValue', false)
  expandedOrder.value = null
}

const toggleOrderDetails = async (orderId) => {
  if (expandedOrder.value === orderId) {
    expandedOrder.value = null
    return
  }

  expandedOrder.value = orderId
  loadingOrderId.value = orderId

  try {
    const order = normalizeOrder(await getOrder(orderId))
    const orderIndex = orders.value.findIndex((item) => item.id === orderId)
    if (orderIndex !== -1) orders.value[orderIndex] = order
  } catch (error) {
    console.error(`Não foi possível carregar os detalhes do pedido ${orderId}.`, error)
    toast.error(error.response?.data?.message || 'Não foi possível carregar os detalhes do pedido.')
  } finally {
    if (loadingOrderId.value === orderId) loadingOrderId.value = null
  }
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
  return [
    [address.street, address.number].filter(Boolean).join(', '),
    address.complement,
    address.neighborhood,
    [address.city, address.state].filter(Boolean).join(' - ')
  ].filter(Boolean).join(' - ')
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
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    card: 'Cartão de Crédito/Débito',
    pix: 'PIX',
    cash: 'Dinheiro',
    meal_voucher: 'Vale Refeição',
    gift_card: 'Vale Presente'
  }
  return methodMap[method] || method
}

const reorder = (order) => {
  emit('reorder', order)
  closeModal()
}
</script>

<style scoped>
/* Modal Overlay */
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

/* Modal Container */
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
  overflow: hidden;
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

/* Header - Identidade visual do perfil */
.modal-header {
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: clamp(1rem, 1.125vw, 1.125rem);
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
  line-height: 1;
}

.btn-close:hover {
  color: #1f2937;
}

/* Modal Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

/* Loading e Empty states */
.loading-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FFC400;
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

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  padding: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  transition: background 0.3s ease;
}

.order-header:hover {
  background: #f1f3f5;
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

/* Status colors */
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

/* Order Details */
.order-details {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.order-summary {
  background: #FFF1C3;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 16px;
}

.summary-item {
  font-size: 0.9rem;
  color: #1f2937;
}

.order-total {
  color: var(--primary);
  font-weight: 600;
  font-size: 1rem;
}

/* Items */
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
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.3s ease;
}

.order-item:hover {
  background: #f9fafb;
  border-radius: 8px;
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
  color: var(--primary);
}

/* Customizations */
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
  transition: all 0.3s ease;
}

.customization-item:hover {
  background: #f1f3f5;
  transform: translateX(5px);
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
  border-left: 3px solid #FFC400;
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
  color: #A4268E;
}

/* Reorder Button */
.order-actions {
  margin-top: 16px;
  text-align: center;
}

.btn-reorder {
  background: var(--bg-yellow);
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-reorder:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-close-modal:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Responsividade */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .order-header {
    padding: 12px;
  }
  
  .order-id {
    font-size: 0.9rem;
  }
  
  .order-date {
    font-size: 0.75rem;
  }
  
  .item-name {
    font-size: 0.9rem;
  }
}
@media (max-width: 476px) {
  .item-image{
    width: 42px;
    height: 42px;
  }
  .btn-reorder{
    padding: 6px 12px;
    font-size: 0.938rem;
  }
  .order-item{
    gap: 10px
  }
  .summary-item{
    font-size: 0.813rem;
  }

  .order-total, .item-price{
    font-size: 0.844rem;
  }
  .item-name, .customization-details, .combo-details{
    font-size: 0.75rem;
  }
}
</style>