<template>
    <div class="banner-inner container-fluid p-0 position-relative">
        <img src="@/assets/images/banner-inner.png" 
        alt="Banner interno" 
        class="w-100 h-100 position-relative z-10">

        <div class="overlay"></div>
    </div>
</template>

<style scoped>
    .banner-inner{
        height: 209px;
    }
    .overlay{
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 11;
    }
</style>