<template>
    <div class="image">
        <img 
              src="@/assets/images/anun.png" 
              alt="Oxente Açaiteria"
              class="logo"
          />
    </div>
</template>

<style scoped>
@media (max-width: 768px) {
    .image{
        margin-left: 0 !important;
        width: 100% !important
    }
}
    .image{
        text-align: end;
        width: 90vw;
        margin-left: calc(-49.5vw + 50%);
    }
    .image img{
        width: 100%;
        max-width: 500px;
        height: 100px;
        object-fit: contain;
        aspect-ratio: 1 / 1.92;
    }
</style>