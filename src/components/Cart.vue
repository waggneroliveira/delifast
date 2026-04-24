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

            <!-- Address info - Só mostra se estiver logado -->
            <div v-if="userStore.isLogged" class="d-flex align-items-center justify-content-between mb-3 rounded my-2">
                <div
                    class="contorno p-2 d-flex align-items-start justify-content-between rounded-3 w-100"
                    :class="{ 'not-address': !selectedDeliveryMethod }"
                >
                    <!-- LEFT ICON -->
                    <div class="d-flex align-items-start w-100">
                        <div class="icon-address rounded-3 d-flex justify-content-center align-items-center p-3 me-2"
                            :class="{ 'not-address': !selectedDeliveryMethod }">
                            <svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.3242 1.35555H20.6327C20.2199 1.35555 19.8346 1.47081 19.4892 1.66038C19.3675 1.47748 19.1715 1.35555 18.9413 1.35555H14.2057C13.8338 1.35555 13.5294 1.66038 13.5294 2.03283C13.5294 2.40529 13.8338 2.71012 14.2057 2.71012H14.9021C14.4759 3.27881 14.2057 3.97707 14.2057 4.742V11.5158C14.2057 11.8883 13.9013 12.1931 13.5294 12.1931H11.5002C11.1283 12.1931 10.8238 11.8883 10.8238 11.5158V0.678238C10.8238 0.305784 10.5194 0.000952597 10.1475 0.000952597L3.38278 0C3.01083 0 2.70641 0.304831 2.70641 0.677286V7.45112C2.70641 7.55971 2.74065 7.66069 2.78727 7.75595C1.11676 8.84668 0 10.7299 0 12.8705V16.9353C0 17.3077 0.30442 17.6125 0.676372 17.6125H2.02914C2.02914 19.0414 2.93575 20.356 4.23429 20.8028C4.62623 20.9381 5.01913 20.999 5.41105 20.999C6.11502 20.999 6.79141 20.7894 7.37266 20.3694C8.25928 19.733 8.79296 18.7033 8.79296 17.6125H15.5645C15.5645 19.1566 16.5586 20.4845 18.0198 20.8781C18.3242 20.959 18.6353 21 18.9397 21C19.8121 21 20.6511 20.6685 21.2875 20.0512C22.1532 19.211 22.5052 17.9984 22.2274 16.8C21.9364 15.5873 20.9689 14.6186 19.7655 14.327C19.718 14.3136 19.6638 14.3136 19.6171 14.3003V5.86039C19.9282 6.009 20.2669 6.09759 20.6322 6.09759H22.3236C22.6956 6.09759 23 5.79276 23 5.4203V2.03278C23 1.66032 22.6956 1.35549 22.3236 1.35549L22.3242 1.35555ZM4.05896 6.77495V1.35555H6.0881V2.71014C6.0881 3.0826 6.39252 3.38743 6.76447 3.38743C7.13642 3.38743 7.44084 3.0826 7.44084 2.71014V1.35555H9.46998V6.77495H4.05896ZM6.58856 19.2655C6.04061 19.6579 5.35091 19.7465 4.67452 19.516C3.90967 19.2521 3.38263 18.4729 3.38263 17.6127H7.44189C7.44189 18.27 7.12415 18.8863 6.58951 19.2654L6.58856 19.2655ZM8.02981 16.2581H1.35254V12.8706C1.35254 10.2556 3.47683 8.12865 6.0881 8.12865H9.47106V11.5162C9.47106 12.6336 10.3843 13.5481 11.5002 13.5481H13.5293C14.6452 13.5481 15.5585 12.6336 15.5585 11.5162V4.74234C15.5585 3.62495 16.4717 2.71046 17.5876 2.71046H18.264V14.294C18.264 14.294 18.2231 14.3074 18.2031 14.3074C18.0947 14.334 17.9862 14.3617 17.8854 14.395C17.8511 14.4084 17.8178 14.415 17.7836 14.4293C17.6751 14.4703 17.5667 14.5169 17.4658 14.5646C17.4392 14.5779 17.405 14.5913 17.3783 14.6055C17.2765 14.6598 17.1757 14.7208 17.0805 14.7884C17.0539 14.8084 17.0263 14.8227 16.9997 14.8361C16.8779 14.917 16.7695 15.0123 16.661 15.1142C16.5868 15.1819 16.505 15.2562 16.4517 15.3238C16.3366 15.4524 16.2348 15.5876 16.1407 15.7239C16.114 15.7648 16.0931 15.8048 16.0665 15.8391C15.9989 15.9544 15.9314 16.0697 15.8771 16.1916C15.8638 16.2116 15.8505 16.2326 15.8429 16.2592H8.02978L8.02981 16.2581ZM20.9172 17.1117C21.0866 17.8366 20.8763 18.5682 20.356 19.0759C19.828 19.5836 19.1116 19.7665 18.381 19.5703C17.4744 19.3331 16.8856 18.5072 16.9198 17.5241C16.9198 17.3822 16.9465 17.2536 16.9874 17.1107C17.0749 16.7792 17.2309 16.4877 17.4678 16.2305C17.4944 16.1962 17.5287 16.1695 17.5762 16.1219C17.9482 15.7761 18.4353 15.5865 18.9499 15.5865C19.1126 15.5865 19.2886 15.6065 19.4636 15.6475C20.1809 15.8171 20.7489 16.3924 20.9249 17.1107L20.9172 17.1117ZM21.6479 4.7421H20.6328C20.0715 4.7421 19.6177 4.28866 19.6177 3.72567C19.6177 3.16363 20.0706 2.70924 20.6328 2.70924H21.6479V4.7421Z" fill="white"/>
                            </svg>
                        </div>

                        <!-- TEXT CONTENT -->
                        <div class="text-content flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="info">
                                    <h5 class="mb-0 fw-bold address-title d-flex justify-content-start align-items-end">
                                        {{ selectedDeliveryMethod ? selectedDeliveryMethod.label : 'Definir forma de entrega' }}
                                        <span 
                                            class="ms-1 bi bi-pencil-square d-flex pointer"
                                            :class="{ 'd-none': !selectedDeliveryMethod }"
                                            @click="openDeliveryMethodModal"
                                        ></span>
                                    </h5>

                                    <small class="finish text-muted fw-medium">
                                        {{ getDeliveryMethodText() }} 
                                    </small>
                                </div>
                                <!-- RIGHT CHECK / EDIT BUTTON -->
                                <div class="d-flex align-items-center justify-content-center gap-2">
                                    <button 
                                        @click="openDeliveryMethodModal" 
                                        class="btn btn-sm p-0 border-0 bg-transparent"
                                        style="line-height: 0;"
                                    >
                                        <svg v-if="!selectedDeliveryMethod" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="0.5" y="0.5" width="27" height="27" rx="13.5" fill="#E9ECEF"/>
                                            <rect x="0.5" y="0.5" width="27" height="27" rx="13.5" stroke="#DEE2E6"/>
                                            <path d="M14.4365 12.9808H17.0573V14.8672H14.4365V17.4016H12.5501V14.8672H9.92925V12.9808H12.5501V10.4032H14.4365V12.9808Z" fill="#6C757D"/>
                                        </svg>
                                    </button>
                                    <svg v-if="selectedDeliveryMethod" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="28" height="28" rx="14" fill="#FF8C00"/>
                                        <path d="M11.8656 18.775L7.19687 14.1063C6.91563 13.825 6.91563 13.3469 7.19687 13.0656L8.20937 12.0531C8.49062 11.7719 8.94062 11.7719 9.22187 12.0531L12.4 15.2031L19.15 8.45313C19.4312 8.17188 19.8812 8.17188 20.1625 8.45313L21.175 9.46563C21.4562 9.74688 21.4562 10.225 21.175 10.5063L12.9062 18.775C12.625 19.0562 12.1469 19.0562 11.8656 18.775Z" fill="white"/>
                                    </svg>
                                </div>
                            </div>

                            <div v-if="selectedDeliveryMethod?.value === 'delivery' && selectedAddress" class="d-flex text-muted small mt-2">
                                <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.451 12.0711C3.55472 12.0469 3.61938 11.9425 3.59513 11.8387C3.57021 11.7344 3.46447 11.6697 3.36276 11.6946C2.18408 11.9728 1.50781 12.4537 1.50781 13.0141C1.50781 14.0196 3.56415 14.5625 5.4991 14.5625C7.43422 14.5625 9.49038 14.0197 9.49038 13.0141C9.49038 12.4537 8.81415 11.9728 7.63544 11.6946C7.53239 11.6697 7.42732 11.7344 7.40306 11.8387C7.37882 11.9425 7.4428 12.0469 7.5472 12.0711C8.49284 12.2941 9.10373 12.6645 9.10373 13.0141C9.10373 13.5637 7.62331 14.1759 5.49971 14.1759C3.37544 14.1759 1.89569 13.5637 1.89569 13.0141C1.89434 12.6645 2.50537 12.2947 3.451 12.0711Z" fill="#595959"/>
                                    <path d="M8.17916 11.0271C8.07543 11.0035 7.97104 11.0668 7.94611 11.1705C7.92119 11.2743 7.98585 11.3787 8.08957 11.4036C9.62253 11.768 10.6127 12.4435 10.6127 13.1251C10.6127 14.2129 8.27148 15.1316 5.49993 15.1316C2.72837 15.1316 0.387192 14.213 0.387192 13.1251C0.387192 12.4435 1.37729 11.7673 2.91028 11.4036C3.014 11.3787 3.07866 11.2749 3.05374 11.1705C3.02882 11.0668 2.92375 11.0035 2.82069 11.0271C1.05472 11.4467 0 12.2314 0 13.1251C0 14.4668 2.41601 15.5182 5.5 15.5182C8.58416 15.5182 11 14.4668 11 13.1251C10.9993 12.2314 9.9451 11.4467 8.17916 11.0271Z" fill="#595959"/>
                                    <path d="M3.81905 10.2363L5.50019 13.1494L7.18268 10.2363C9.32316 9.51632 10.7565 7.52461 10.7565 5.25619C10.7565 2.35791 8.39845 0 5.50033 0C2.60222 0 0.244141 2.35808 0.244141 5.25619C0.244141 7.52461 1.67795 9.51629 3.81905 10.2363ZM5.50019 0.387266C8.18485 0.387266 10.3691 2.57154 10.3691 5.25619C10.3691 7.38115 9.01262 9.2442 6.9927 9.89217L6.92198 9.91507L5.50015 12.3768L4.08034 9.91576L4.00894 9.89219C1.9883 9.24425 0.630455 7.38134 0.630455 5.25621C0.630455 2.57156 2.81485 0.387266 5.50019 0.387266Z" fill="#595959"/>
                                    <path d="M5.50096 8.56332C7.3647 8.56332 8.88083 7.04719 8.88083 5.18346C8.88083 3.31972 7.3647 1.80359 5.50096 1.80359C3.63722 1.80359 2.12109 3.31972 2.12109 5.18346C2.12109 7.04719 3.63722 8.56332 5.50096 8.56332ZM5.50096 2.19103C7.15112 2.19103 8.49339 3.53339 8.49339 5.18415C8.49339 6.8343 7.15103 8.17658 5.50096 8.17658C3.85089 8.17658 2.50784 6.83422 2.50784 5.18415C2.50784 3.53332 3.8502 2.19103 5.50096 2.19103Z" fill="#595959"/>
                                </svg>

                                <p class="ms-2 mb-0 col-11">
                                    {{ formatAddress(selectedAddress) }}
                                    <button 
                                        @click="openAddressModal" 
                                        class="btn btn-sm p-0 border-0 bg-transparent text-primary"
                                        style="line-height: 0;"
                                    >
                                        Alterar
                                    </button>
                                </p>
                            </div>

                            <div v-else-if="selectedDeliveryMethod?.value === 'delivery' && !selectedAddress" class="d-flex text-muted small mt-2">
                                <p class="mb-0">Clique no botão + para adicionar um endereço de entrega</p>
                            </div>

                            <div v-else-if="selectedDeliveryMethod?.value === 'pickup'" class="d-flex text-muted small mt-2">
                                <p class="mb-0">Retirada na loja selecionada</p>
                            </div>

                            <div v-else-if="selectedDeliveryMethod?.value === 'local'" class="d-flex text-muted small mt-2">
                                <p class="mb-0">Pagamento presencial selecionado</p>
                            </div>

                            <div v-else class="d-flex text-muted small mt-2">
                                <p class="mb-0">Clique no botão + para selecionar a forma de entrega</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Address Modal -->
            <AddressModal
                v-model="showAddressModal"
                @address-selected="handleAddressSelected"
            />
                            
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
                        <div v-for="ad in getItemAditionalsList(item)" :key="ad.name" class="small d-flex justify-content-between align-items-center ms-0">
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

    <!-- Delivery Method Modal -->
    <DeliveryMethodModal
        v-model="showDeliveryMethodModal"
        @method-selected="handleDeliveryMethodSelected"
    />
</template>

<script setup>
    import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
    import { useToast } from 'vue-toastification'
    import IdentifyModal from './IdentifyModal.vue'
    import ProductModal from './ProductModal.vue'
    import AddressModal from './AddressModal.vue'
    import DeliveryMethodModal from './DeliveryMethodModal.vue'
    import { useCartStore } from '@/stores/useCartStore'
    import { useUserStore } from '@/stores/useUserStore'

    const toast = useToast()
    const cart = useCartStore()
    const userStore = useUserStore()
    const showModal = ref(false)
    const showAddressModal = ref(false)
    const showDeliveryMethodModal = ref(false)
    const selectedAddress = ref(null)
    const selectedDeliveryMethod = ref(null)

    // Product modal
    const showProductModal = ref(false)
    const selectedProduct = ref(null)

    // Função para obter o texto do método de entrega
    const getDeliveryMethodText = () => {
        if (!selectedDeliveryMethod.value) return 'Selecione uma forma de entrega'
        
        if (selectedDeliveryMethod.value.value === 'delivery') {
            return `Entrega em domicílio • ${selectedDeliveryMethod.value.timeEstimate}`
        } else if (selectedDeliveryMethod.value.value === 'pickup') {
            return `Retirada na loja • ${selectedDeliveryMethod.value.timeEstimate}`
        }else if (selectedDeliveryMethod.value.value === 'local') {
            return `Consumo no local`
        }
        return selectedDeliveryMethod.value.label
    }

    // Função para abrir modal de seleção de entrega
    const openDeliveryMethodModal = () => {
        if (!userStore.isLogged) {
            toast.warning('Você precisa se identificar primeiro!', {
                timeout: 3000
            })
            return
        }
        showDeliveryMethodModal.value = true
    }

    // Função para lidar com a seleção do método de entrega
    const handleDeliveryMethodSelected = (method) => {
        selectedDeliveryMethod.value = method
        
        if (method.value === 'delivery' && !selectedAddress.value) {
            setTimeout(() => {
                openAddressModal()
            }, 300)
        }
        
        localStorage.setItem('selectedDeliveryMethod', JSON.stringify(method))
        
        toast.info(`Forma de entrega selecionada: ${method.label}`, {
            timeout: 3000
        })
    }

    // Função para atualizar o endereço selecionado
    const updateSelectedAddress = () => {
        if (!userStore.isLogged) {
            selectedAddress.value = null
            return
        }

        const addressesJson = localStorage.getItem('addresses')
        if (!addressesJson) {
            selectedAddress.value = null
            localStorage.removeItem('selectedAddress')
            return
        }
        
        const addresses = JSON.parse(addressesJson)
        const savedSelectedId = localStorage.getItem('selectedAddressId')
        
        if (savedSelectedId) {
            const foundAddress = addresses.find(addr => addr.id === parseInt(savedSelectedId))
            if (foundAddress) {
                selectedAddress.value = foundAddress
                localStorage.setItem('selectedAddress', JSON.stringify(foundAddress))
            } else {
                const primaryAddress = addresses.find(addr => addr.primary === true)
                if (primaryAddress) {
                    selectedAddress.value = primaryAddress
                    localStorage.setItem('selectedAddressId', primaryAddress.id.toString())
                    localStorage.setItem('selectedAddress', JSON.stringify(primaryAddress))
                } else {
                    selectedAddress.value = null
                    localStorage.removeItem('selectedAddress')
                    localStorage.removeItem('selectedAddressId')
                }
            }
        } else {
            const primaryAddress = addresses.find(addr => addr.primary === true)
            if (primaryAddress) {
                selectedAddress.value = primaryAddress
                localStorage.setItem('selectedAddressId', primaryAddress.id.toString())
                localStorage.setItem('selectedAddress', JSON.stringify(primaryAddress))
            } else {
                selectedAddress.value = null
                localStorage.removeItem('selectedAddress')
            }
        }
    }

    // Carregar método de entrega salvo
    const loadSavedDeliveryMethod = () => {
        const savedMethod = localStorage.getItem('selectedDeliveryMethod')
        if (savedMethod) {
            try {
                selectedDeliveryMethod.value = JSON.parse(savedMethod)
            } catch (e) {
                console.error('Erro ao carregar método de entrega:', e)
            }
        }
    }

    const loadSavedAddress = () => {
        updateSelectedAddress()
    }

    const openAddressModal = () => {
        if (!userStore.isLogged) {
            toast.warning('Você precisa se identificar primeiro!', {
                timeout: 3000
            })
            return
        }
        showAddressModal.value = true
    }

    const handleAddressSelected = (address) => {
        if (address) {
            selectedAddress.value = address
            localStorage.setItem('selectedAddressId', address.id.toString())
            localStorage.setItem('selectedAddress', JSON.stringify(address))
        } else {
            selectedAddress.value = null
            localStorage.removeItem('selectedAddressId')
            localStorage.removeItem('selectedAddress')
        }
    }

    const formatAddress = (address) => {
        if (!address) return ''
        const parts = []
        if (address.street) parts.push(address.street)
        if (address.number) parts.push(address.number)
        if (address.complement) parts.push(address.complement)
        if (address.neighborhood) parts.push(address.neighborhood)
        if (address.city && address.state) parts.push(`${address.city} - ${address.state}`)
        if (address.cep) parts.push(address.cep)
        return parts.join(', ')
    }

    const openProductModal = (product) => {
        const originalAditionals = product.aditionals ? JSON.parse(JSON.stringify(product.aditionals)) : []
        
        const aditionalsWithQuantity = product.aditionals ? JSON.parse(JSON.stringify(product.aditionals)) : []
        
        if (product.customization?.hasToppings && product.customization?.toppings && !aditionalsWithQuantity.length) {
            aditionalsWithQuantity.push({
                title: 'Adicionais',
                items: product.customization.toppings.map(topping => ({
                    ...topping,
                    quantity: product.selectedToppings?.find(t => t.id === topping.id)?.quantity || 0
                }))
            })
        }
        
        selectedProduct.value = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            oldPrice: product.oldPrice,
            image: product.images?.[0] || product.image,
            cashback: product.cashback || 0,
            cuisineType: product.cuisineType,
            customization: product.customization,
            
            selectedOption: product.selectedOption || null,
            originalSelectedOption: product.selectedOption || null,
            
            selectedSize: product.selectedSize || null,
            originalSelectedSize: product.selectedSize || null,
            
            selectedFlavors: product.selectedFlavors || [],
            originalSelectedFlavors: product.selectedFlavors || [],
            
            aditionals: aditionalsWithQuantity,
            originalAditionals: originalAditionals,
            
            isEditing: true
        }

        showProductModal.value = true
    }

    // Computed para saber se pode confirmar
    const canConfirm = computed(() => {
        if (!userStore.isLogged) return false
        if (!selectedDeliveryMethod.value) return false
        if (selectedDeliveryMethod.value.value === 'delivery' && !selectedAddress.value) return false
        return true
    })

    const handleIdentify = ({ whatsapp: wpp, fullName: name }) => {
        userStore.login({ fullName: name, whatsapp: wpp })
        showModal.value = false
        
        toast.success(`Bem-vindo(a), ${name}! Login realizado com sucesso!`, {
            timeout: 4000
        })
        
        setTimeout(() => {
            updateSelectedAddress()
            loadSavedDeliveryMethod()
        }, 100)
    }

    const handleStorageChange = (e) => {
        if ((e.key === 'addresses' || e.key === 'addressesUpdated') && userStore.isLogged) {
            updateSelectedAddress()
        }
    }

    const handleCustomAddressUpdate = () => {
        if (userStore.isLogged) {
            updateSelectedAddress()
        }
    }

    // Observa mudanças no localStorage de endereços
    watch(() => userStore.isLogged, async (isLogged) => {
        if (isLogged) {
            await updateSelectedAddress()
            loadSavedDeliveryMethod()
        } else {
            selectedAddress.value = null
            selectedDeliveryMethod.value = null
            localStorage.removeItem('selectedAddressId')
            localStorage.removeItem('selectedAddress')
            localStorage.removeItem('selectedDeliveryMethod')
        }
    })

    // Watcher para observar mudanças no selectedAddress via localStorage
    const checkAddressChanges = () => {
        const checkInterval = setInterval(() => {
            if (userStore.isLogged) {
            const savedAddressId = localStorage.getItem('selectedAddressId')
            const savedAddress = localStorage.getItem('selectedAddress')
            
            if (savedAddressId && savedAddress) {
                const parsedAddress = JSON.parse(savedAddress)
                if (selectedAddress.value?.id !== parsedAddress.id) {
                console.log('Endereço atualizado, recarregando...')
                updateSelectedAddress()
                }
            }
            }
        }, 500) // Verifica a cada 500ms
        
        // Limpa o intervalo quando o componente for desmontado
        onUnmounted(() => {
            clearInterval(checkInterval)
        })
    }

    onMounted(() => {
        userStore.loadUserFromStorage()
        loadSavedAddress()
        loadSavedDeliveryMethod()
        checkAddressChanges() // Adicione esta linha
        
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('addresses-updated', handleCustomAddressUpdate)
        
        window.addEventListener('user-login', (event) => {
            if (event.detail) {
            userStore.login({
                fullName: event.detail.fullName,
                whatsapp: event.detail.whatsapp
            })
            setTimeout(() => {
                updateSelectedAddress()
                loadSavedDeliveryMethod()
            }, 100)
            }
        })
    })

    onUnmounted(() => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('addresses-updated', handleCustomAddressUpdate)
    })

    const handleConfirm = () => {
        if (!canConfirm.value) {
            if (!userStore.isLogged) {
                toast.warning('Você precisa se identificar antes de continuar!', {
                    timeout: 3000
                })
            } else if (!selectedDeliveryMethod.value) {
                toast.warning('Por favor, selecione uma forma de entrega antes de continuar!', {
                    timeout: 3000
                })
            } else if (selectedDeliveryMethod.value.value === 'delivery' && !selectedAddress.value) {
                toast.warning('Por favor, selecione um endereço de entrega antes de continuar!', {
                    timeout: 3000
                })
            }
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
    
    const getItemTotalWithAditionals = (item) => {
        if (!item) return 0
        
        const productTotal = item.price * item.quantity
        const aditionalsTotal = getItemAditionalsTotal(item) * item.quantity
        
        return productTotal + aditionalsTotal
    }
</script>

<style scoped>
.pointer{
    cursor: pointer;
    display: flex;
}
.icon-address.not-address{
    background: #E9ECEF;
}
.icon-address.not-address svg path {
  fill: #595959;
}
.contorno.not-address{
    border-color: #E0E0E0;
}
.contorno{
    border: 1px solid #ff8c00;
}
.finish{
    font-size: 0.75rem !important;
}
.address-title{
    color: #595959;
    font-size: 0.938rem;
}
.icon-address{
    background: #FF8C00; 
}
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