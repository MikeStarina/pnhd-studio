/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['mui-tel-input'],
    webpack: (config) => {
        config.externals = [...config.externals, { canvas: 'canvas' }]; // required to make Konva & react-konva work
        return config;
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
        ],
    },
};

export default nextConfig;
