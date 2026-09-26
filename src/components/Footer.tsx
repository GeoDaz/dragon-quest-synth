import React from 'react';
import Link from '@/components/Link';
import useTranslate from '@/hooks/useTranslate';

const Footer = () => {
	const { isFr } = useTranslate();

	if (isFr) {
		return (
			<footer className="footer">
				Dragon Quest Synthesis n&apos;est ni affilié à, ni sponsorisé, ni soutenu,
				ni approuvé par Square Enix Co., Ltd., Bird Studio ou l&apos;une de leurs
				filiales ou sociétés affiliées.
				<br />
				Dragon Quest, Dragon Quest Monsters, ainsi que tous les noms, personnages
				et images associés sont des marques commerciales ou des marques déposées
				de Square Enix Co., Ltd. © SQUARE ENIX.
				<br />
				<div className="mt-2">
					<Link href="/privacy">Politique de confidentialité</Link>
					{' · '}
					<Link href="/terms">Conditions d&apos;utilisation</Link>
				</div>
			</footer>
		);
	}

	return (
		<footer className="footer">
			Dragon Quest Synthesis is not affiliated with, sponsored, endorsed, or
			approved by Square Enix Co., Ltd., Bird Studio, or any of their subsidiaries
			or affiliates.
			<br />
			Dragon Quest, Dragon Quest Monsters, and all related names, characters, and
			images are trademarks or registered trademarks of Square Enix Co., Ltd. ©
			SQUARE ENIX.
			<div className="mt-2">
				<Link href="/privacy">Privacy Policy</Link>
				{' · '}
				<Link href="/terms">Terms of Service</Link>
			</div>
		</footer>
	);
};

export default Footer;
