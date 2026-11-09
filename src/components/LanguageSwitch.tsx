import { useRouter } from 'next/router';
import Link from './Link';
import { makeClassName, storeLanguage } from '@/functions';

const LanguageSwitch = () => {
	const { asPath, locale } = useRouter();
	return (
		<div className="language-switch" role="group" aria-label="Language">
			{['en', 'fr'].map(code => (
				<Link
					key={code}
					href={asPath}
					locale={code}
					hrefLang={code}
					onClick={() => storeLanguage(code)}
					aria-current={code == locale ? 'true' : undefined}
					className={makeClassName('language-switch-item', code == locale && 'active')}
				>
					{code.toUpperCase()}
				</Link>
			))}
		</div>
	);
};

export default LanguageSwitch;
