import { useCallback, useEffect, useState } from 'react';

const useHash = () => {
	const [state, setState] = useState<{ hash?: string; nav: number }>({ nav: 0 });

	const navigate = useCallback((hash: string) => {
		setState(prev => ({ hash, nav: prev.nav + 1 }));
	}, []);

	useEffect(() => {
		const initial = decodeURIComponent(window.location.hash.replace('#', ''));
		if (!initial) return;
		window.history.replaceState(
			window.history.state,
			'',
			window.location.pathname + window.location.search
		);
		navigate(initial);
	}, [navigate]);

	return { ...state, navigate };
};

export default useHash;
