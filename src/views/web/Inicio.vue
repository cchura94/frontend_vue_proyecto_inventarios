<template>
    <v-carousel>
        <v-carousel-item src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" cover></v-carousel-item>

        <v-carousel-item src="https://cdn.vuetifyjs.com/images/cards/hotel.jpg" cover></v-carousel-item>

        <v-carousel-item src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg" cover></v-carousel-item>
    </v-carousel>

    <section class="py-10">
        <!-- Presentación -->
        <div class="text-center mb-8">
            <v-chip color="primary" variant="tonal" class="mb-3" prepend-icon="mdi-package-variant-closed">
                Software de gestión de inventarios
            </v-chip>

            <h2 class="text-h4 font-weight-bold mb-2">
                Todo tu negocio bajo control
            </h2>

            <p class="text-body-1 text-medium-emphasis mx-auto" style="max-width: 760px">
                Administra compras, ventas e inventarios en tiempo real desde un solo sistema.
                Controla tus productos, almacenes, sucursales y usuarios de forma simple y segura.
            </p>
        </div>

        <!-- Características -->
        <v-window v-model="onboarding" reverse show-arrows>
            <v-window-item v-for="slide in slides" :key="slide.title">
                <v-card class="slide-card d-flex flex-column ma-2" elevation="2" rounded="lg">
                    <v-card-text class="d-flex flex-column h-100 pa-6">
                        <v-avatar :color="slide.color" variant="tonal" size="56" class="rounded-lg mb-4">
                            <v-icon :icon="slide.icon" size="30" />
                        </v-avatar>

                        <h3 class="text-h5 font-weight-bold mb-2">
                            {{ slide.title }}
                        </h3>

                        <p class="text-body-2 text-medium-emphasis mb-4">
                            {{ slide.description }}
                        </p>

                        <div class="d-flex flex-wrap ga-2 mt-auto">
                            <v-chip v-for="feature in slide.features" :key="feature" :color="slide.color"
                                prepend-icon="mdi-check-circle-outline" size="small" variant="tonal">
                                {{ feature }}
                            </v-chip>
                        </div>
                    </v-card-text>
                </v-card>
            </v-window-item>
        </v-window>

        <!-- Llamado a la acción -->
        <div class="text-center mt-8">
            <v-btn color="primary" size="large" rounded="lg" prepend-icon="mdi-rocket-launch" to="/auth/login">
                Comenzar ahora
            </v-btn>

            <p class="text-body-2 text-medium-emphasis mt-3 mb-0">
                Accede con tu cuenta y empieza a gestionar compras, ventas e inventarios hoy mismo.
            </p>
        </div>
    </section>

    <v-parallax src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
        <div class="d-flex flex-column fill-height justify-center align-center text-white">
            <h1 class="text-headline-large font-weight-thin mt-0 mb-4">
                Vuetify
            </h1>
            <h4 class="subheading my-0">
                Build your application today!
            </h4>
        </div>
    </v-parallax>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const onboarding = ref(0)

const slides = ref([
    {
        title: 'Inventarios inteligentes',
        description: 'Controla tu stock en tiempo real y evita pérdidas. Administra productos, categorías, almacenes y sucursales desde un solo lugar.',
        icon: 'mdi-package-variant-closed',
        color: 'primary',
        features: ['Stock en tiempo real', 'Múltiples almacenes', 'Alertas de stock mínimo'],
    },
    {
        title: 'Compras sin complicaciones',
        description: 'Registra proveedores y compras, y actualiza tu inventario automáticamente con cada ingreso de mercadería.',
        icon: 'mdi-cart-arrow-down',
        color: 'teal',
        features: ['Gestión de proveedores', 'Órdenes de compra', 'Ingreso automático al stock'],
    },
    {
        title: 'Ventas y facturación',
        description: 'Registra ventas de forma rápida, descuenta el inventario al instante y mantén el historial de tus clientes siempre disponible.',
        icon: 'mdi-point-of-sale',
        color: 'orange',
        features: ['Ventas rápidas', 'Descuento automático de stock', 'Historial de clientes'],
    },
    {
        title: 'Reportes y control total',
        description: 'Toma mejores decisiones con reportes claros, gestiona usuarios con roles y consulta la información de cada sucursal.',
        icon: 'mdi-chart-box-outline',
        color: 'deep-purple',
        features: ['Reportes de gestión', 'Usuarios y permisos', 'Control multi-sucursal'],
    },
])
</script>

<style scoped>
.slide-card {
    min-height: 320px;
}

@media (max-width: 600px) {
    .slide-card {
        min-height: 380px;
    }
}
</style>
