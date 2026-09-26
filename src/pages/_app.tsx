import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-switch-button-react/src/style.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@/styles/index.css';
import { useEffect, useState } from 'react';
import Router from 'next/router';
import { Spinner } from 'react-bootstrap';
import type { AppProps } from 'next/app';
import Header from '@/components/Header';
import Donate from '@/components/Donate';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LanguageContext } from '@/context/language';
import { processLanguage } from '@/functions';

export default function App({ Component, pageProps }: AppProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [language, setLanguage] = useState<boolean>(false);

	// loading on page change
	useEffect(() => {
		setLanguage(processLanguage());

		if (process.env.NODE_ENV === 'development') return;
		const start = () => setLoading(true);
		const end = () => setLoading(false);
		Router.events.on('routeChangeStart', start);
		Router.events.on('routeChangeComplete', end);
		Router.events.on('routeChangeError', end);
		return () => {
			Router.events.off('routeChangeStart', start);
			Router.events.off('routeChangeComplete', end);
			Router.events.off('routeChangeError', end);
		};
	}, []);

	return (
		<ErrorBoundary>
			<Header />
			<LanguageContext.Provider value={language}>
				{loading ?
					<div className="spinner-wrapper text-center mt-5 mb-5">
						<Spinner animation="border" className="xl" variant="primary" />
					</div>
				:	<Component {...pageProps} />}
				<Donate />
				<Footer />
			</LanguageContext.Provider>
		</ErrorBoundary>
	);
}
