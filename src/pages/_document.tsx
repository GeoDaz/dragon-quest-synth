import { Html, Head, Main, NextScript } from 'next/document';
import Header from '@/components/Header';
import { SITE_URL } from '@/consts/env';

export default function Document() {
	return (
		<Html lang="en" data-bs-theme="dark">
			<Head>
				<meta charSet="utf-8" />
				<meta property="og:locale" content="en_US" />
				<meta name="theme-color" content="#000000" />
				<meta name="MobileOptimized" content="width" />
				<meta property="og:site_name" content="Dragon Quest Synthesis" />
				<meta property="og:type" content="website" />
				<meta name="robots" content="index, follow" />
				<meta property="og:url" content={SITE_URL} />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap"
					rel="stylesheet"
				/>
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/logo192.png" />
				<link rel="manifest" href="/manifest.json" />
			</Head>
			<body>
				<Header />
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
