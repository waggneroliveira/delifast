<template>
    <div class="offcanvas offcanvas-end cart-canvas" tabindex="-1" id="cartCanvas">
  
        <!-- Header -->
        <div class="cart-header d-flex justify-content-between align-items-center">
            <span class="my-cart">
                <svg class="me-2" width="26" height="23" viewBox="0 0 26 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.184 4.46937H8.78054V6.22461H14.184V4.46937ZM17.7862 4.24996V10.2836L6.48409 12.719L4.2777 2.05591H0.900568C0.661723 2.05591 0.43266 2.17149 0.26377 2.37722C0.0948811 2.58295 0 2.86199 0 3.15294C0 3.44388 0.0948811 3.72292 0.26377 3.92865C0.43266 4.13438 0.661723 4.24996 0.900568 4.24996H2.89983L5.80867 18.5113H17.7862V16.3173H7.21355L6.91637 14.8582L19.5874 12.1266V4.24996H17.7862ZM6.07884 19.6083C5.81166 19.6083 5.55049 19.7049 5.32834 19.8857C5.1062 20.0665 4.93305 20.3235 4.83081 20.6242C4.72857 20.9248 4.70182 21.2557 4.75394 21.5749C4.80606 21.8941 4.93472 22.1873 5.12364 22.4175C5.31256 22.6476 5.55326 22.8043 5.8153 22.8678C6.07734 22.9313 6.34895 22.8987 6.59579 22.7742C6.84262 22.6496 7.0536 22.4387 7.20203 22.1681C7.35046 21.8975 7.42969 21.5793 7.42969 21.2539C7.42969 20.8175 7.28737 20.3989 7.03403 20.0903C6.7807 19.7817 6.43711 19.6083 6.07884 19.6083ZM16.8857 19.6083C16.6185 19.6083 16.3573 19.7049 16.1352 19.8857C15.913 20.0665 15.7399 20.3235 15.6376 20.6242C15.5354 20.9248 15.5086 21.2557 15.5608 21.5749C15.6129 21.8941 15.7415 22.1873 15.9305 22.4175C16.1194 22.6476 16.3601 22.8043 16.6221 22.8678C16.8842 22.9313 17.1558 22.8987 17.4026 22.7742C17.6494 22.6496 17.8604 22.4387 18.0089 22.1681C18.1573 21.8975 18.2365 21.5793 18.2365 21.2539C18.2365 20.8175 18.0942 20.3989 17.8409 20.0903C17.5875 19.7817 17.2439 19.6083 16.8857 19.6083Z" fill="#595959"/>
                    <circle cx="21.5" cy="4.5" r="4.5" fill="#595959"/>
                    <path d="M20.5423 5.23H19.0123V4.31H20.5423V2.57H21.4623V4.31H22.9923V5.23H21.4623V6.97H20.5423V5.23Z" fill="white"/>
                    </svg>
                    Meu Carrinho
                </span>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>

        <!-- Body -->
        <div class="offcanvas-body p-3">

            <!-- Identifique-se -->
            <div
                class="identify-box d-flex align-items-center justify-content-between mb-3 border p-2 rounded"
                @click="showModal = true"
            >
                <div class="d-flex justify-content-center align-items-center gap-2">
                    <div class="icon-user rounded-3 d-flex justify-content-center align-items-center p-3">
                        <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.2963 12.6129C13.6296 12.4645 16.2963 9.68226 16.2963 6.30645C16.2963 2.81936 13.4815 0 10 0C6.51852 0 3.7037 2.81936 3.7037 6.30645C3.7037 9.68226 6.37037 12.4274 9.7037 12.6129C4.22222 12.7984 0 17.1758 0 23H1.48148C1.48148 17.8065 5.14815 14.0968 10 14.0968C14.8519 14.0968 18.5185 17.8065 18.5185 23H20C20 17.1758 15.7778 12.7984 10.2963 12.6129ZM5.18518 6.34355C5.18518 3.67258 7.33333 1.52097 10 1.52097C12.6667 1.52097 14.8148 3.67258 14.8148 6.34355C14.8148 9.01452 12.6667 11.1661 10 11.1661C7.33333 11.1661 5.18518 8.97742 5.18518 6.34355Z" fill="#595959"/>
                        </svg>
                    </div>
                    <div class="text-start">
                        <strong>{{ userStore.isLogged ? `Olá, ${userStore.fullName}!` : 'Identifique-se aqui' }}</strong>
                        <div class="small text-muted">
                            {{ userStore.isLogged ? 'Você já está identificado' : 'Antes de finalizar o pedido, simples e rápido!' }}
                        </div>
                    </div>
                </div>
                <span class="border rounded-pill d-flex justify-content-center align-items-center arrow">›</span>
            </div>
            
            <!-- Badge de Warning -->
            <div v-if="!canConfirm" class="mb-2 text-center">
                <span class="badge bg-warning p-2 text-dark d-flex align-items-center justify-content-center gap-1">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    Você precisa se cadastrar antes de confirmar o pedido!
                </span>
            </div>

            <IdentifyModal
                v-model="showModal"
                @submit="handleIdentify"
            />

            <!-- Item -->
            <div 
                v-for="item in cart.items" 
                :key="item.id + (item.selectedOption || '')" 
                class="cart-item d-flex mb-3"
                @click="openProductModal(item)"
            >   
                <div class="d-flex flex-column">
                    <img :src="item.image" class="item-img">
                    <span class="badge cashback my-2 small d-none">
                        {{ item.cashback }}% cashback
                    </span>
                </div>
                
                <div class="flex-grow-1 ms-2">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <div class="fw-bold">{{ item.name }}</div>
                        <span class="me-2 bi bi-pencil-square"></span>
                    </div>
                    
                    <p class="text-muted small mb-2">
                        {{ item.description }}
                    </p>
                    
                    <!-- Mostrar adicionais selecionados -->
                    <div v-if="getItemAditionalsList(item).length > 0" class="mb-2">
                        <div class="small fw-semibold mb-1 d-flex align-items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4V20M20 12H4" stroke="#000" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Adicionais
                        </div>
                        <div v-for="ad in getItemAditionalsList(item)" :key="ad.name" class="small d-flex justify-content-between align-items-center ms-1">
                            <span class="text-muted">{{ ad.quantity }}x {{ ad.name }}</span>
                            <span class="text-success fw-semibold">+{{ formatPrice(ad.total) }}</span>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mt-0">
                        <div class="d-flex flex-column gap-0">
                            <strong>{{ formatPrice(getItemTotalWithAditionals(item)) }}</strong>
                            <div class="d-flex gap-1" v-if="item.oldPrice">
                                <div class="text-muted small text-decoration-line-through">
                                    {{ formatPrice(item.oldPrice) }}
                                </div>
                                <div class="percent rounded-1 text-white d-flex justify-content-center align-items-center px-1">
                                    {{ Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) }}%
                                </div>
                            </div>
                        </div>

                        <div class="qty-control d-flex justify-content-center align-items-center">
                            <button class="btn-minus" @click.stop="cart.decrease(item.id, item.selectedOption)">-</button>
                            <span class="mx-2">{{ item.quantity }}</span>
                            <button class="btn-plus" @click.stop="cart.increase(item.id, item.selectedOption)">+</button>
                        </div>
                        
                        <button 
                            @click.stop="cart.remove(item.id, item.selectedOption)" 
                            type="button" 
                            class="reset-button btn btn-red text-white rounded py-1 px-2"
                        >
                            Excluir
                        </button>    
                    </div>
                </div>
            </div>

            <!-- Totais -->
            <div class="cart-summary mt-3">
                <!-- Subtotal -->
                <div class="d-flex justify-content-between mb-2">
                    <span class="info-value">Sub Total:</span>
                    <strong>{{ formatPrice(cart.subTotal) }}</strong>
                </div>

                <!-- Desconto -->
                <div class="d-flex justify-content-between mb-2" v-if="cart.discount > 0">
                    <span class="info-value">Desconto:</span>
                    <strong>- {{ formatPrice(cart.discount) }}</strong>
                </div>
                
                <!-- Cashback -->
                <div class="d-flex justify-content-between d-none" v-if="cart.cashbackTotal > 0">
                    <span class="info-value">Cashback:</span>
                    <strong>+{{ formatPrice(cart.cashbackTotal) }}</strong>
                </div>

                <!-- Cupom -->
                <div class="mt-2 d-flex gap-2 justify-content-between align-items-center mb-4">
                    <span class="info-value">Cupom:</span>
                    <input type="text" class="form-control w-75" placeholder="Digite o código aqui">
                </div>
                
                <!-- Total -->
                <div class="d-flex justify-content-between">
                    <span class="info-value">Total:</span>
                    <strong>{{ formatPrice(cart.total) }}</strong>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-3 d-flex justify-content-end">
            <button 
                class="btn btn-confirm px-3 d-flex justify-content-center align-items-center"
                :class="{ 'opacity-50': !canConfirm }"
                @click="handleConfirm"
            >
                Avançar ›
            </button>
        </div>
    </div>

    <!-- Product Modal -->
    <ProductModal
        v-model:show="showProductModal"
        :product="selectedProduct"
    />
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { useToast } from 'vue-toastification'
    import IdentifyModal from './IdentifyModal.vue'
    import ProductModal from './ProductModal.vue'
    import { useCartStore } from '@/stores/useCartStore'
    import { useUserStore } from '@/stores/useUserStore'

    const toast = useToast()
    const cart = useCartStore()
    const userStore = useUserStore()
    const showModal = ref(false)

    // Product modal
    const showProductModal = ref(false)
    const selectedProduct = ref(null)

    const openProductModal = (product) => {
        // Guarda uma cópia dos adicionais originais para referência
        const originalAditionals = product.aditionals ? JSON.parse(JSON.stringify(product.aditionals)) : []
        
        selectedProduct.value = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            cashback: product.cashback || 0,
            options: product.options || [],
            selectedOption: product.selectedOption || null,
            
            // Adicionais com as quantidades atuais
            aditionals: product.aditionals ? JSON.parse(JSON.stringify(product.aditionals)) : [],
            
            // Guarda uma cópia original para o modal usar como base
            originalAditionals: originalAditionals,
            
            // Para identificar que é uma edição
            originalSelectedOption: product.selectedOption
        }

        showProductModal.value = true
    }

    // Computed para saber se pode confirmar
    const canConfirm = computed(() => {
        return userStore.isLogged
    })

    const handleIdentify = ({ whatsapp: wpp, fullName: name }) => {
        userStore.login({ fullName: name, whatsapp: wpp })
        showModal.value = false
        
        toast.success(`Bem-vindo(a), ${name}! Login realizado com sucesso!`, {
            timeout: 4000
        })
    }

    onMounted(() => {
        userStore.loadUserFromStorage()
    })

    const handleConfirm = () => {
        if (!canConfirm.value) {
            toast.warning('Você precisa se identificar antes de continuar!', {
                timeout: 3000
            })
            return
        }
        
        toast.success('Pedido confirmado com sucesso!', {
            timeout: 4000
        })
    }

    const formatPrice = (value) => {
        if (!value && value !== 0) return 'R$ 0,00'
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    // =========================
    // FUNÇÕES PARA ADICIONAIS
    // =========================
    
    // Calcula o total dos adicionais de um item
    const getItemAditionalsTotal = (item) => {
        if (!item || !item.aditionals) return 0
        
        let total = 0
        item.aditionals.forEach(group => {
            group.items.forEach(aditional => {
                if (aditional.quantity > 0 && aditional.price) {
                    total += (aditional.price * aditional.quantity)
                }
            })
        })
        return total
    }
    
    // Retorna a lista de adicionais com detalhes
    const getItemAditionalsList = (item) => {
        if (!item || !item.aditionals) return []
        
        const list = []
        item.aditionals.forEach(group => {
            group.items.forEach(aditional => {
                if (aditional.quantity > 0) {
                    list.push({
                        name: aditional.name,
                        quantity: aditional.quantity,
                        price: aditional.price || 0,
                        total: (aditional.price || 0) * aditional.quantity
                    })
                }
            })
        })
        return list
    }
    
    // Calcula o total do item (produto + adicionais)
    const getItemTotalWithAditionals = (item) => {
        if (!item) return 0
        
        const productTotal = item.price * item.quantity
        const aditionalsTotal = getItemAditionalsTotal(item) * item.quantity
        
        return productTotal + aditionalsTotal
    }
</script>

<style scoped>
.cart-item .fw-bold{
    font-size: 0.938rem;
}
.info-value{
    font-size: 0.875rem;
    font-weight: 600;
}
.btn-reset {
    all: unset;
    cursor: pointer;
}
.btn-red{
    background: #D93030;
    font-size: 0.625rem;
    font-weight: 600;
}
.btn-red:hover, .btn:focus-visible, :not(.btn-check)+.btn:active:focus-visible{
    background: #D93030;
}
.price{
    font-size: clamp(0.75rem, 1.25vw, 1rem);
}
.cashback{
    background: #FFC400;
    color: #2F2B2B;
    font-size: clamp(0.75rem, 0.75vw, 0.875rem) !important;
}
.small{
    font-size: clamp(0.75rem, 0.75vw, 0.875rem) !important;
}
.percent{
    background: #A4268E;
    font-size: 0.75rem;
    font-weight: 600;
}
.my-cart{
    color: #595959;
}
.arrow{
    border-color: #6D6B6B !important;
    height: 28px;
    width: 28px;
}
.icon-user{
    background: #E9ECEF;
}
.cart-canvas {
  width: 360px;
}

/* Header */
.cart-header {
  background: #FFF1C3;
  padding: 12px 16px;
  font-weight: 600;
}

/* Identificação */
.identify-box {
  background: rgb(222 226 230 / 10%);
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
}

/* Item */
.cart-item {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
}

.item-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
}

/* Quantidade */
.qty-control button {
  border: none;
  background: transparent;
}
.qty-control span{
    font-weight: 800;
}
.btn-plus {
    color: #5CB85C;
    font-size: 1.563rem;
    font-weight: 800;
}

.btn-minus {
    color: #D93030;
    font-size: 1.563rem;
    font-weight: 800;
}

/* Botão final */
.btn-confirm {
  background: #FFC400 !important;
  color: #000000 !important;
  border: none;
  border-radius: inherit;
  font-weight: 500;
  max-width: 130px;
  height: 30px;
  font-size: 0.875rem;
}
</style>