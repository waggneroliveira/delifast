<script setup>
import { onMounted, ref } from 'vue'
import { api, resolveApiAssetUrl } from '@/services/api'

const emit = defineEmits(['availability-change'])
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
  }
})
</script>

<template>
  <div
    v-for="(announcement, index) in announcements"
    :key="announcement.id || index"
    class="image my-4 mt-0 my-md-0"
  >
    <component
      :is="announcement.link ? 'a' : 'div'"
      class="announcement-link"
      v-bind="announcement.link ? { href: announcement.link } : {}"
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
    </component>
  </div>
</template>

<style scoped>
.image {
  text-align: end;
  width: 90vw;
  margin-left: calc(-49.5vw + 50%);
}

.announcement-link,
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
