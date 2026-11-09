import { useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import { getStoredLanguage, processLanguage, storeLanguage } from '@/functions';

const LanguageRedirect = () => {
	const { locale } = useRouter();

	useLayoutEffect(() => {
		let target = getStoredLanguage();
		if (!target) {
			target = processLanguage() ? 'fr' : 'en';
			storeLanguage(target);
		}
		if (target == locale) return;
		const { pathname, search, hash } = window.location;
		const path = pathname.replace(/^\/fr(?=\/|$)/, '') || '/';
		const prefix = target == 'en' ? '' : `/${target}`;
		window.location.replace(
			`${prefix}${path == '/' && prefix ? '' : path}${search}${hash}`
		);
	}, []);

	return null;
};

export default LanguageRedirect;
