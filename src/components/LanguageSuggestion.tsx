import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from './Link';
import Icon from './Icon';
import { processLanguage } from '@/functions';

const DISMISSED_KEY = 'language-suggestion-dismissed';

const LanguageSuggestion = () => {
	const { asPath, locale } = useRouter();
	const [shown, setShown] = useState(false);

	useEffect(() => {
		try {
			if (localStorage.getItem(DISMISSED_KEY)) return;
		} catch {}
		setShown(locale != 'fr' && processLanguage());
	}, [locale]);

	if (!shown) return null;

	const dismiss = () => {
		setShown(false);
		try {
			localStorage.setItem(DISMISSED_KEY, '1');
		} catch {}
	};

	return (
		<div className="language-suggestion" lang="fr">
			<span>Ce site existe aussi en français.</span>
			<Link href={asPath} locale="fr" hrefLang="fr" className="btn btn-sm btn-primary">
				Passer en français
			</Link>
			<button type="button" className="language-suggestion-close" onClick={dismiss} title="Fermer">
				<Icon name="x-lg" />
			</button>
		</div>
	);
};

export default LanguageSuggestion;
