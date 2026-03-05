import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bilu - Finanzas Personales',
        short_name: 'Bilu',
        description: 'Gestiona tus ingresos y gastos de forma privada y eficiente.',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#1d4ed8',
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    }
}
