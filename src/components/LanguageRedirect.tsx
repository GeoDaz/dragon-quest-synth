import { useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import { processLanguage } from '@/functions';

const VISITED_KEY = 'language-visited';

const LanguageRedirect = () => {
	const { locale } = useRouter();

	useLayoutEffect(() => {
		try {
			if (localStorage.getItem(VISITED_KEY)) return;
			localStorage.setItem(VISITED_KEY, '1');
		} catch {
			return;
		}
		if (locale != 'fr' && processLanguage()) {
			const { pathname, search, hash } = window.location;
			window.location.replace(`/fr${pathname == '/' ? '' : pathname}${search}${hash}`);
		}
	}, []);

	return null;
};

export default LanguageRedirect;
