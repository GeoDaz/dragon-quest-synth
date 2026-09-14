import React from 'react';
import { DONATE_URL } from '@/consts/env';
import useTranslate from '@/hooks/useTranslate';

// Volontairement discret : une ligne juste au-dessus du footer, pas un bandeau
// sous le header.
const Donate = () => {
	const { isFr } = useTranslate();

	return (
		<div className="donate">
			{isFr ?
				<>
					Soutenez-nous sur{' '}
					<a
						href={DONATE_URL}
						target="_blank"
						rel="noopener noreferrer nofollow"
						className="btn btn-outline-light"
					>
						Ko-fi
					</a>{' '}
					— Dragon Quest Synthesis est un projet de fan sans profits. Vos dons
					aident à payer l&apos;hébergement et à maintenir le site en ligne
				</>
			:	<>
					Support us on{' '}
					<a
						href={DONATE_URL}
						target="_blank"
						rel="noopener noreferrer nofollow"
						className="btn btn-outline-light"
					>
						Ko-fi
					</a>{' '}
					— Dragon Quest Synthesis is a non-profit fan-made project. Your
					donations help support hosting and maintenance costs to keep the site
					online.
				</>
			}
		</div>
	);
};

export default Donate;
