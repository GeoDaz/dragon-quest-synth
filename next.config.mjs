import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig = {
	reactStrictMode: true,
	i18n: {
		locales: ['en', 'fr'],
		defaultLocale: 'en',
		localeDetection: false,
	},
	async redirects() {
		return [
			{
				source: '/lines',
				destination: '/',
				permanent: true,
			},
		];
	},
	webpack: config => {
		config.resolve.fallback = { fs: false };
		return config;
	},
	images: {
		unoptimized: true,
	},
};

export default nextConfig;

initOpenNextCloudflareForDev();
