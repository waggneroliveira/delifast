<template>
  <aside class="aside position-relative">

    <!-- Menu Desktop -->
    <div class="menu w-100 d-none d-md-flex flex-column">
      <a 
        href="#" 
        v-for="category in categories" 
        :key="category.id"
        class="menu-link" 
        :class="{ 'active': activeCategory === category.id }"
        @click.prevent="scrollToCategory(category.id)"
      >
        {{ category.name }}
      </a>
    </div>

    <!-- Mobile Swiper -->
    <Swiper
      v-if="categories.length"
      :modules="[Navigation]"
      class="d-md-none menu-swiper"
      :slides-per-view="'auto'"
      space-between="8"
      navigation
    >
      <SwiperSlide v-for="category in categories" :key="category.id">
        <a 
          href="#" 
          class="menu-link" 
          :class="{ 'active': activeCategory === category.id }"
          @click.prevent="scrollToCategory(category.id)"
        >
          {{ category.name }}
        </a>
      </SwiperSlide>
    </Swiper>

    <!-- Banner -->
    <div class="mt-5 text-start d-none d-md-block">
      <img 
        src="@/assets/images/anuncio.png" 
        class="img-fluid"
      />
    </div>

  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
// Swiper
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'

// CSS do Swiper
import 'swiper/css'
import 'swiper/css/navigation'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
    default: () => []
  }
})

const activeCategory = ref(null)

// Função para rolar até a categoria
const scrollToCategory = (categoryId) => {
  activeCategory.value = categoryId
  
  // Procura o elemento da categoria pelo ID
  const element = document.getElementById(`category-${categoryId}`)
  
  if (element) {
    // Calcula a posição com offset para não ficar colado no topo
    const offset = 100 // Altura do header + um pouco mais
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// Função para atualizar a categoria ativa baseado no scroll
const updateActiveCategoryOnScroll = () => {
  const scrollPosition = window.scrollY + 120 // Offset para considerar o header fixo
  
  // Variável para armazenar a categoria atual
  let currentCategory = null
  
  // Percorre todas as categorias
  for (let i = 0; i < props.categories.length; i++) {
    const category = props.categories[i]
    const element = document.getElementById(`category-${category.id}`)
    
    if (element) {
      const elementTop = element.offsetTop
      const elementBottom = elementTop + element.offsetHeight
      
      // Se o scroll está dentro da seção da categoria
      if (scrollPosition >= elementTop - 100 && scrollPosition < elementBottom - 100) {
        currentCategory = category.id
        break
      }
    }
  }
  
  // Se encontrou uma categoria, atualiza o active
  if (currentCategory && activeCategory.value !== currentCategory) {
    activeCategory.value = currentCategory
  }
  
  // Se não encontrou nenhuma categoria e tem pelo menos uma, marca a primeira
  if (!currentCategory && props.categories.length > 0 && scrollPosition < 200) {
    activeCategory.value = props.categories[0].id
  }
}

// Função throttle para melhor performance
let scrollTimeout
const handleScroll = () => {
  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout)
  }
  scrollTimeout = requestAnimationFrame(() => {
    updateActiveCategoryOnScroll()
  })
}

// Verifica se as seções existem e atualiza o active inicial
const initializeActiveCategory = () => {
  nextTick(() => {
    if (props.categories.length > 0) {
      // Verifica qual categoria está visível no momento
      updateActiveCategoryOnScroll()
      
      // Se ainda não definiu, marca a primeira
      if (!activeCategory.value && props.categories.length > 0) {
        activeCategory.value = props.categories[0].id
      }
    }
  })
}

// Observa mudanças nas categorias
watch(() => props.categories, () => {
  initializeActiveCategory()
}, { immediate: true, deep: true })

// Adiciona evento de scroll
onMounted(() => {
  initializeActiveCategory()
  window.addEventListener('scroll', handleScroll)
})

// Limpa evento ao desmontar
onUnmounted(() => {
  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout)
  }
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.aside {
  width: 224px;
  height: 100%;
}

/* Menu desktop */
.menu-link {
  padding: 10px 0;
  color: #666;
  text-decoration: none;
  border-bottom: 1px solid #eee;
  font-size: clamp(0.875rem, 1vw, 1rem);
  transition: 0.2s;
  width: 75%;
  display: block;
  cursor: pointer;
}

.menu-link:hover {
  color: #A4268E;
}

.menu-link.active {
  color: #A4268E;
  font-weight: 500;
  border-bottom: 2px solid #A4268E;
}

/* Mobile Swiper styling */
.menu-swiper {
  padding: 10px 0;
}

.menu-swiper .swiper-slide {
  width: auto;
}

.menu-swiper .menu-link {
  white-space: nowrap;
  padding: 8px 0;
  width: auto;
  border-bottom: none;
  margin-right: 16px;
}

.menu-swiper .menu-link.active {
  border-bottom: 2px solid #A4268E;
}
</style>