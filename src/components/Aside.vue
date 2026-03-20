<template>
  <aside class="d-flex flex-column justify-content-center align-items-center aside position-relative">

    <!-- Logo -->
    <div class="image text-center mb-3 position-relative rounded-circle">
        <img 
            src="@/assets/images/logo.png" 
            alt="Oxente Açaiteria"
            class="logo"
        />
    </div>

    <!-- Nome + status -->
    <div class="text-start mb-4 w-100">
      <h5 class="fw-bold text-purple mb-1">Oxente Açaiteria</h5>
      <small class="d-block">Praticidade que alimenta.</small>
      
      <div class="d-flex justify-content-start align-items-center mt-2">
        <span class="status-dot me-1"></span>
        <small>Aberto</small>
      </div>
    </div>

    <!-- Menu -->
    <div class="menu w-100">
      <a href="#" class="menu-link active">Combos promocionais</a>
      <a href="#" class="menu-link">Entradas</a>
      <a href="#" class="menu-link">Hamburgers</a>
      <a href="#" class="menu-link">Carne</a>
      <a href="#" class="menu-link">Bebidas</a>
      <a href="#" class="menu-link">Açaí</a>
    </div>

    <!-- Banner -->
    <div class="mt-5 border text-center">
      <img 
        src="@/assets/images/anuncio.png" 
        class="img-fluid"
      />
    </div>

  </aside>
</template>

<style scoped>
    small{
        font-size: clamp(0.938rem, 1vw, 1rem) !important;
        color: #333633;
    }
    .aside {
        width: 224px;
        min-height: 100vh;
    }
    .image{
        width: 210px;
        height: 210px;
        margin-top: -170px;
        background: #FFF;
        border: 7px solid rgba(0, 0, 0, 0.10);
    }
    .logo {
        width: 195px;
        height: 100%;
        object-fit: contain;
    }

    .text-purple {
        color: #A4268E;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        background: #28a745;
        border-radius: 50%;
    }

    .menu {
        display: flex;
        flex-direction: column;
    }

    .menu-link {
        padding: 10px 0;
        color: #666;
        text-decoration: none;
        border-bottom: 1px solid #eee;
        font-size: clamp(0.875rem, 1vw, 1rem);
        transition: 0.2s;
    }

    .menu-link:hover {
        color: #A4268E;
    }

    .menu-link.active {
        color: #A4268E;
        font-weight: 500;
        border-bottom: 2px solid #A4268E;
    }
</style>