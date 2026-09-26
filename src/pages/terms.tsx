import React from 'react';
import Link from '@/components/Link';
import Layout from '@/components/Layout';
import useTranslate from '@/hooks/useTranslate';
import {
	DISCORD_URL,
	LEGAL_UPDATED_AT,
	LEGAL_UPDATED_AT_FR,
	SITE_URL,
} from '@/consts/env';

// Voir privacy.tsx : deux versions complètes, pas un dictionnaire de phrases.
const PageTerms = () => {
	const { isFr } = useTranslate();

	if (isFr) {
		return (
			<Layout
				title="Conditions d'utilisation"
				metatitle="Conditions d'utilisation"
				metadescription="Les règles d'utilisation de Dragon Quest Synthesis."
			>
				<p className="text-muted">
					Dernière mise à jour : {LEGAL_UPDATED_AT_FR}
				</p>

				<p>
					Ces conditions régissent votre utilisation de Dragon Quest Synthesis à
					l&apos;adresse <Link href="/">{SITE_URL}</Link>. En utilisant le site,
					vous les acceptez. Si vous ne les acceptez pas, merci de ne pas
					utiliser le site.
				</p>

				<h2>1. Ce qu&apos;est ce service</h2>
				<p>
					Dragon Quest Synthesis est un projet de fan gratuit et non commercial
					qui permet de consulter les tables de synthèse des jeux Dragon Quest
					Monsters et de construire ses propres lignées. Il n&apos;y a ni offre
					payante ni publicité. Les dons sont volontaires et n&apos;ouvrent aucun
					droit, aucune garantie et aucune priorité d&apos;aucune sorte.
				</p>

				<h2>2. Pas de compte</h2>
				<p>
					Le site ne demande aucune inscription. Tout est accessible sans
					identification, et les lignées que vous construisez restent dans votre
					navigateur. Voir notre{' '}
					<Link href="/privacy">politique de confidentialité</Link> pour le
					détail.
				</p>

				<h2>3. Ce que vous construisez</h2>
				<p>
					<strong>Vos lignées vous appartiennent.</strong> Nous ne revendiquons
					aucune propriété sur ce que vous créez et nous ne le stockons pas. Nous
					n&apos;avons besoin que d&apos;une permission technique ponctuelle :
					traiter le contenu d&apos;une lignée lorsque vous nous demandez de la
					convertir en image. Cette permission s&apos;arrête dès le fichier
					produit.
				</p>
				<p>
					Si vous partagez le code ou l&apos;image d&apos;une lignée, vous le
					faites par vos propres moyens : les copies que d&apos;autres ont
					téléchargées échappent, évidemment, à notre portée comme à la vôtre.
				</p>

				<h2>4. Usage acceptable</h2>
				<p>Vous vous engagez à ne pas :</p>
				<ul>
					<li>
						téléverser dans une lignée un contenu illégal, haineux, harcelant,
						sexuellement explicite, ou visant une personne en particulier ;
					</li>
					<li>
						téléverser un contenu que vous n&apos;avez pas le droit
						d&apos;utiliser ;
					</li>
					<li>
						sonder, surcharger ou perturber le site ou son service de rendu
						d&apos;images ;
					</li>
					<li>
						automatiser des requêtes en masse ou aspirer le site d&apos;une
						manière qui le dégrade pour les autres.
					</li>
				</ul>

				<h2>5. Propriété intellectuelle</h2>
				<p>
					Dragon Quest, Dragon Quest Monsters, ainsi que tous les noms,
					personnages et images associés sont des marques commerciales ou des
					marques déposées de Square Enix Co., Ltd. © SQUARE ENIX. Dragon Quest
					Synthesis n&apos;est ni affilié à, ni sponsorisé, ni soutenu, ni
					approuvé par Square Enix Co., Ltd., Bird Studio ou l&apos;une de leurs
					filiales ou sociétés affiliées. Les éléments issus de la franchise sont
					utilisés ici dans un cadre de fan non commercial.
				</p>

				<h2>6. Disponibilité et garantie</h2>
				<p>
					Le site est fourni « en l&apos;état », gratuitement, sans garantie de
					disponibilité, d&apos;exactitude des données ni de conservation de
					votre travail. Il repose sur une infrastructure gratuite ou à bas coût
					et peut être interrompu, modifié ou arrêté. Comme vos lignées vivent
					dans le stockage de votre navigateur, exportez celles que vous seriez
					contrarié de perdre.
				</p>

				<h2>7. Responsabilité</h2>
				<p>
					Dans toute la mesure permise par la loi, nous ne sommes pas
					responsables des dommages indirects ou consécutifs résultant de votre
					utilisation du site, y compris la perte de contenu. Rien ici ne limite
					une responsabilité qui ne peut légalement l&apos;être, et vos droits
					légaux de consommateur ne sont pas affectés.
				</p>

				<h2>8. Modifications</h2>
				<p>
					Ces conditions peuvent changer. La date en haut de cette page reflète
					la dernière révision, et les changements significatifs sont annoncés
					sur notre{' '}
					<a href={DISCORD_URL} target="_blank" rel="noreferrer">
						serveur Discord
					</a>
					.
				</p>

				<h2>9. Droit applicable</h2>
				<p>
					Ces conditions sont régies par le droit français. Si vous êtes
					consommateur, cela ne vous prive pas des protections impératives du
					droit de votre propre pays.
				</p>

				<h2>10. Contact</h2>
				<p>
					<a href={DISCORD_URL} target="_blank" rel="noreferrer">
						Notre serveur Discord
					</a>
				</p>
			</Layout>
		);
	}

	return (
		<Layout
			title="Terms of Service"
			metatitle="Terms of Service"
			metadescription="The rules for using Dragon Quest Synthesis."
		>
			<p className="text-muted">Last updated: {LEGAL_UPDATED_AT}</p>

			<p>
				These terms govern your use of Dragon Quest Synthesis at{' '}
				<Link href="/">{SITE_URL}</Link>. By using the site you accept them. If you
				do not, please do not use the site.
			</p>

			<h2>1. What this service is</h2>
			<p>
				Dragon Quest Synthesis is a free, non-commercial fan project that lets you
				browse the synthesis tables of the Dragon Quest Monsters games and build
				your own lines. There is no paid tier and no advertising. Donations are
				voluntary and buy no rights, guarantees, or priority of any kind.
			</p>

			<h2>2. No accounts</h2>
			<p>
				The site asks for no sign-up. Everything is available without identifying
				yourself, and the lines you build stay in your browser. See our{' '}
				<Link href="/privacy">Privacy Policy</Link> for the details.
			</p>

			<h2>3. What you build</h2>
			<p>
				<strong>Your lines remain yours.</strong> We claim no ownership over what
				you create, and we do not store it. All we need is a one-off technical
				permission: to process a line&apos;s content when you ask us to turn it
				into an image. That permission ends as soon as the file is produced.
			</p>
			<p>
				If you share a line&apos;s code or image, you do so by your own means:
				copies other people have downloaded are, of course, beyond our reach and
				yours.
			</p>

			<h2>4. Acceptable use</h2>
			<p>You agree not to:</p>
			<ul>
				<li>
					upload into a line any content that is illegal, hateful, harassing,
					sexually explicit, or that targets an individual;
				</li>
				<li>upload content you do not have the right to use;</li>
				<li>
					probe, overload, or disrupt the site or its image rendering service;
				</li>
				<li>
					automate bulk requests or scrape the site in a way that degrades it for
					others.
				</li>
			</ul>

			<h2>5. Intellectual property</h2>
			<p>
				Dragon Quest, Dragon Quest Monsters, and all related names, characters, and
				images are trademarks or registered trademarks of Square Enix Co., Ltd. ©
				SQUARE ENIX. Dragon Quest Synthesis is not affiliated with, sponsored,
				endorsed, or approved by Square Enix Co., Ltd., Bird Studio, or any of
				their subsidiaries or affiliates. Franchise material is used here in a
				non-commercial fan context.
			</p>

			<h2>6. Availability and warranty</h2>
			<p>
				The site is provided &quot;as is&quot;, free of charge, with no guarantee
				of availability, accuracy, or preservation of your work. It runs on free
				and low-cost infrastructure and may be interrupted, changed, or
				discontinued. Since your lines live in your browser&apos;s storage, export
				anything you would be upset to lose.
			</p>

			<h2>7. Liability</h2>
			<p>
				To the fullest extent permitted by law, we are not liable for indirect or
				consequential damages arising from your use of the site, including lost
				content. Nothing here limits liability that cannot lawfully be limited, and
				your statutory rights as a consumer are unaffected.
			</p>

			<h2>8. Changes</h2>
			<p>
				These terms may change. The date at the top of this page reflects the
				latest revision, and significant changes are announced on our{' '}
				<a href={DISCORD_URL} target="_blank" rel="noreferrer">
					Discord server
				</a>
				.
			</p>

			<h2>9. Governing law</h2>
			<p>
				These terms are governed by French law. If you are a consumer, this does
				not deprive you of the protections of your own country&apos;s mandatory
				law.
			</p>

			<h2>10. Contact</h2>
			<p>
				<a href={DISCORD_URL} target="_blank" rel="noreferrer">
					Our Discord server
				</a>
			</p>
		</Layout>
	);
};

export default PageTerms;
