import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const getHash = () =>
	typeof window !== 'undefined' ?
		decodeURIComponent(window.location.hash.replace('#', ''))
	:	undefined;

const useHash = () => {
	const router = useRouter();
	const [state, setState] = useState<{ hash?: string; nav: number }>({ nav: 0 });

	const sync = () => {
		setState(prev => ({ hash: getHash(), nav: prev.nav + 1 }));
	};

	useEffect(() => {
		sync();
		window.addEventListener('hashchange', sync);
		router.events.on('hashChangeComplete', sync);
		return () => {
			window.removeEventListener('hashchange', sync);
			router.events.off('hashChangeComplete', sync);
		};
	}, [router.events]);

	return state;
};

export default useHash;
