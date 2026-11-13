<script setup>
    import { onMounted, ref } from 'vue'
    import fallbackImage from '@/assets/images/banner-inner.png'
    import { api, resolveApiAssetUrl } from '@/services/api'

    const desktopImage = ref(fallbackImage)
    const mobileImage = ref(fallbackImage)

    onMounted(async () => {
        try {
            const { data } = await api.get('/slides')
            const slide = data.data

            if (slide?.path_image) desktopImage.value = resolveApiAssetUrl(slide.path_image)
            if (slide?.path_image_mobile) mobileImage.value = resolveApiAssetUrl(slide.path_image_mobile)
            else mobileImage.value = desktopImage.value
        } catch (error) {
            console.error('Não foi possível carregar o banner da API.', error)
        }
    })
</script>

<template>
    <div class="banner-inner container-fluid p-0 position-relative text-end">
        <picture class="d-block w-100 h-100 position-relative z-10">
            <source :srcset="mobileImage" media="(max-width: 680px)">
            <img
                :src="desktopImage"
                alt="Banner interno"
                class="w-100 h-100 cover"
            >
        </picture>

        <div class="overlay">
            <!-- Botão menu mobile -->
            <button 
            class="btn d-md-none"
            data-bs-toggle="offcanvas" 
            data-bs-target="#mobileMenu"
            >
            <i class="bi bi-list display-2 text-white"></i>
            </button>
        </div>
    </div>

</template>

<style scoped>
    .banner-inner{
        height: 209px;
    }
    .cover{
        object-fit: cover;
    }
    .overlay{
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 11;
    }
    @media (max-width: 680px) {
        .banner-inner {
            height: 130px;
        }
    
    }
</style>