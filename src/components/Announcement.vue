<script setup>
import { onMounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import { api, resolveApiAssetUrl } from '@/services/api'

import 'swiper/css'

const emit = defineEmits(['availability-change', 'startup-ready'])
const announcements = ref([])

const loadAnnouncements = async () => {
  const { data } = await api.get('/announcements')
  const topRightAnnouncements = data?.data?.['top-right']

  if (!Array.isArray(topRightAnnouncements)) {
    throw new Error('A resposta da API não contém a lista de anúncios top-right.')
  }

  announcements.value = topRightAnnouncements.filter((announcement) => (
    announcement && (
      announcement.path_image
      || announcement.path_image_mobile
      || announcement.path_image_vertical
    )
  ))
  emit('availability-change', announcements.value.length > 0)
}

onMounted(async () => {
  try {
    await loadAnnouncements()
  } catch (error) {
    console.error('Não foi possível carregar os anúncios da API.', error)
    emit('availability-change', false)
  } finally {
    emit('startup-ready')
  }
})
</script>

<template>
  <div v-if="announcements.length" class="image my-4 mt-0 my-md-0">
    <Swiper
      :modules="[Autoplay]"
      :slides-per-view="1"
      :loop="announcements.length > 1"
      :autoplay="{ delay: 7000, disableOnInteraction: false }"
      :allow-touch-move="false"
      :simulate-touch="false"
      :prevent-clicks="true"
      :prevent-clicks-propagation="true"
      class="announcement-swiper"
    >
      <SwiperSlide
        v-for="(announcement, index) in announcements"
        :key="announcement.id || index"
      >
        <picture>
          <source
            v-if="announcement.path_image_vertical"
            :srcset="resolveApiAssetUrl(announcement.path_image_vertical)"
            media="(max-width: 480px)"
          >
          <source
            v-if="announcement.path_image_mobile || announcement.path_image_vertical"
            :srcset="resolveApiAssetUrl(announcement.path_image_mobile || announcement.path_image_vertical)"
            media="(max-width: 768px)"
          >
          <img
            :src="resolveApiAssetUrl(
              announcement.path_image || announcement.path_image_mobile || announcement.path_image_vertical,
            )"
            alt="Anúncio"
            class="logo"
          >
        </picture>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.image {
  text-align: end;
  width: 90vw;
  margin-left: calc(-49.5vw + 50%);
}

picture {
  display: block;
}

.image img {
    width: 100%;
    max-width: 800px;
    height: 120px;
    object-fit: cover;
    aspect-ratio: 1 / 1.92;
}

@media (max-width: 768px) {
  .image {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .image img {
    height: auto;
    max-height: 320px;
    object-fit: contain;
  }
}
</style>
