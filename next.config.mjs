/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Отдельная папка сборки для параллельных серверов (e2e, второй dev): общая .next ломается при одновременной записи.
    distDir: process.env.NEXT_DIST_DIR || '.next',
    transpilePackages: ['mui-tel-input'],
    // src/instrumentation.ts: повторная отправка заявок стартует вместе с сервером.
    experimental: { instrumentationHook: true },
    webpack: (config) => {
        config.externals = [...config.externals, { canvas: 'canvas' }]; // required to make Konva & react-konva work
        return config;
    },
    async headers() {
        return [{
            source: '/:path*',
            headers: [
                {key: 'X-Content-Type-Options', value: 'nosniff'},
                {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
                {key: 'Strict-Transport-Security', value: 'max-age=31536000'},
                {key: 'Permissions-Policy', value: 'camera=(), microphone=(), usb=()'},
                // Встраивать сайт можно только к себе и в Метрику: Вебвизор проигрывает записи сессий во фрейме.
                // Полную CSP не задаём: Метрика, Roistat и карты подгружают скрипты с меняющихся адресов.
                {
                    key: 'Content-Security-Policy',
                    value: "frame-ancestors 'self' https://metrika.yandex.ru https://metrika.yandex.by https://metrica.yandex.com https://metrica.yandex.com.tr https://webvisor.com https://*.webvisor.com",
                },
            ],
        }];
    },
    async redirects() {
        return [
            {
                source: '/kak-stirat-futbolki-s-printom',
                destination: '/blog',
                permanent: true, // 308 redirect
            },
            {source: '/shop/:slug/constructor', destination: '/constructor?product=:slug', permanent: true}, // старый 3D-конструктор удалён
            {source: '/auth/account', destination: '/profile', permanent: true},
            {source: '/auth/account/:path*', destination: '/profile', permanent: true},
            {source: '/admin', destination: '/profile', permanent: true},
            {source: '/admin/products', destination: '/profile/products', permanent: true},
            {source: '/admin/products/:path*', destination: '/profile/products/:path*', permanent: true},
            {source: '/admin/banners', destination: '/profile/banners', permanent: true},
            {source: '/admin/banners/:path*', destination: '/profile/banners/:path*', permanent: true},
            {source: '/admin/blog', destination: '/profile/blog', permanent: true},
            {source: '/admin/blog/:path*', destination: '/profile/blog/:path*', permanent: true},
            {source: '/page23123483.html', destination: '/', permanent: true},
            {source: '/.well-known/apple-app-site-association', destination: '/', permanent: true},
            {source: '/shop%20%D0%BE%D1%82%D0%B7%D1%8B%D0%B2%D1%8B', destination: '/shop', permanent: true},
            {source: '/tproduct/1-352755267661-klassicheskii-hudi-kakao', destination: '/shop?type=hoodie', permanent: true},
            {source: '/.well-known/apple-app-site-association', destination: '/', permanent: true},
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.pnhd.ru',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'pnhdstudioapi.ru',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api.pnhd.ru',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api-stage.pnhd.ru',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;