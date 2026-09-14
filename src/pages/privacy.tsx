import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import useTranslate from '@/hooks/useTranslate';
import {
	DISCORD_URL,
	LEGAL_UPDATED_AT,
	LEGAL_UPDATED_AT_FR,
	SITE_URL,
} from '@/consts/env';

// Deux versions complètes plutôt qu'un dictionnaire de phrases : un texte légal
// se relit dans sa langue, il ne se recompose pas mot à mot.
const PagePrivacy = () => {
	const { isFr } = useTranslate();

	if (isFr) {
		return (
			<Layout
				title="Politique de confidentialité"
				metatitle="Politique de confidentialité"
				metadescription="Les données que Dragon Quest Synthesis traite, et celles qu'il ne traite pas."
			>
				<p className="text-muted">
					Dernière mise à jour : {LEGAL_UPDATED_AT_FR}
				</p>

				<p>
					Dragon Quest Synthesis est un projet de fan gratuit et non commercial,
					accessible à l&apos;adresse <Link href="/">{SITE_URL}</Link>. Cette
					page explique ce que nous collectons, pourquoi, et ce que vous pouvez
					y faire. La réponse courte : il n&apos;y a pas de compte, pas de mot de
					passe, pas de base de données de membres. Vous pouvez utiliser la
					totalité du site sans nous donner quoi que ce soit.
				</p>

				<h2>1. Ce que nous ne collectons pas</h2>
				<p>
					Le site ne propose ni inscription ni connexion. Nous ne demandons ni
					adresse e-mail, ni pseudonyme, ni date de naissance, et nous ne
					stockons aucun profil utilisateur. Nous ne diffusons pas de publicité
					et n&apos;intégrons aucun traceur publicitaire. Nous ne vendons, ne
					louons et ne partageons aucune donnée avec des annonceurs. Nous ne
					traitons aucune donnée de paiement : les dons passent par Ko-fi, sur
					leur propre site et sous leur propre politique de confidentialité.
				</p>

				<h2>2. Ce qui reste dans votre navigateur</h2>
				<p>
					Nous ne posons aucun cookie publicitaire ni de mesure. La ligne que
					vous construisez dans le <Link href="/build">Builder</Link> est
					enregistrée dans le stockage local (<em>localStorage</em>) de votre
					navigateur, afin que vous la retrouviez en revenant. Elle ne nous est
					jamais envoyée et ne quitte pas votre appareil : vider les données du
					site dans votre navigateur l&apos;efface définitivement.
				</p>
				<p>
					Il en va de même des images que vous ajoutez vous-même à une ligne :
					elles sont lues localement par votre navigateur et intégrées à la
					ligne, sans téléversement vers un serveur.
				</p>

				<h2>3. Le service de génération d&apos;images</h2>
				<p>
					Lorsque vous demandez le téléchargement d&apos;une ligne au format
					image, le contenu de cette ligne — y compris les images personnalisées
					qu&apos;elle contient — est transmis à notre service de rendu, le temps
					de produire le fichier PNG qui vous est renvoyé. Ce contenu n&apos;est
					pas conservé après la génération, et il n&apos;est associé à aucune
					identité puisque nous n&apos;en avons aucune. Si vous préférez que rien
					ne sorte de votre navigateur, l&apos;export au format code reste
					entièrement local.
				</p>

				<h2>4. Mesure d&apos;audience</h2>
				<p>
					Nous utilisons Vercel Analytics, qui compte les pages vues sans cookie,
					sans identifiant publicitaire et sans construire de profil. Cet outil
					ne vous suit pas sur d&apos;autres sites.
				</p>

				<h2>5. Hébergement</h2>
				<p>
					Le site est servi par le réseau de diffusion de Vercel, depuis
					l&apos;emplacement le plus proche de vous. Comme tout serveur web,
					celui qui vous répond voit votre adresse IP le temps de la requête.
					Certaines images de monstres sont chargées directement par votre
					navigateur depuis des sources externes, qui voient donc également votre
					adresse IP, comme pour n&apos;importe quelle image sur le web.
				</p>

				<h2>6. Base légale (visiteurs de l&apos;EEE et du Royaume-Uni)</h2>
				<ul>
					<li>
						<strong>Statistiques agrégées</strong> — intérêt légitime à savoir
						si le site fonctionne et s&apos;il est utilisé, à partir de données
						qui ne vous identifient pas.
					</li>
					<li>
						<strong>Génération d&apos;images</strong> — exécution du service que
						vous demandez : nous ne pouvons pas produire l&apos;image sans
						recevoir la ligne à dessiner.
					</li>
				</ul>

				<h2>7. Durée de conservation</h2>
				<p>
					Nous ne conservons pas de données vous concernant. Le contenu envoyé au
					service de rendu est traité puis abandonné. Les statistiques
					d&apos;audience sont agrégées et ne permettent pas de revenir à un
					visiteur.
				</p>

				<h2>8. Vos droits</h2>
				<p>
					Vous pouvez nous demander l&apos;accès, la rectification, l&apos;export
					ou la suppression de vos données, et vous opposer à leur traitement.
					Comme nous ne détenons aucun compte, il n&apos;y a en pratique rien à
					extraire ni à supprimer de notre côté, mais écrivez-nous sur notre{' '}
					<a href={DISCORD_URL} target="_blank" rel="noreferrer">
						serveur Discord
					</a>{' '}
					et nous répondrons sous 30 jours. Si vous résidez dans l&apos;EEE et
					estimez que nous avons mal traité vos données, vous pouvez saisir votre
					autorité nationale de protection des données — en France, la CNIL.
				</p>

				<h2>9. Mineurs</h2>
				<p>
					Le site est ouvert à tous et ne collecte aucune donnée
					d&apos;inscription, donc aucune donnée d&apos;enfant.
				</p>

				<h2>10. Tiers auxquels nous faisons appel</h2>
				<ul>
					<li>
						<strong>Vercel</strong> — hébergement, diffusion et mesure
						d&apos;audience sans cookie.
					</li>
					<li>
						<strong>Notre service de rendu</strong> — génération des images de
						lignes, à votre demande.
					</li>
					<li>
						<strong>Ko-fi</strong> — dons, uniquement si vous choisissez d&apos;y
						aller.
					</li>
				</ul>

				<h2>11. Modifications</h2>
				<p>
					Si nous modifions cette politique d&apos;une manière qui vous concerne,
					nous mettrons à jour la date en haut de cette page et l&apos;annoncerons
					sur notre serveur Discord.
				</p>

				<h2>12. Contact</h2>
				<p>
					<a href={DISCORD_URL} target="_blank" rel="noreferrer">
						Notre serveur Discord
					</a>
				</p>

				<p className="mt-4">
					Voir aussi nos <Link href="/terms">conditions d&apos;utilisation</Link>.
				</p>
			</Layout>
		);
	}

	return (
		<Layout
			title="Privacy Policy"
			metatitle="Privacy Policy"
			metadescription="What data Dragon Quest Synthesis handles, and what it does not."
		>
			<p className="text-muted">Last updated: {LEGAL_UPDATED_AT}</p>

			<p>
				Dragon Quest Synthesis is a free, non-commercial fan project available at{' '}
				<Link href="/">{SITE_URL}</Link>. This page explains what we collect, why,
				and what you can do about it. The short answer: there is no account, no
				password, and no member database. You can use the entire site without
				giving us anything.
			</p>

			<h2>1. What we do not collect</h2>
			<p>
				The site has no sign-up and no sign-in. We never ask for an email address,
				a pseudonym, or a date of birth, and we store no user profile. We run no
				advertising and embed no ad trackers. We do not sell, rent, or share any
				data with advertisers. We handle no payment data: donations go through
				Ko-fi, on their own site and under their own privacy policy.
			</p>

			<h2>2. What stays in your browser</h2>
			<p>
				We set no advertising or analytics cookies. The line you build in the{' '}
				<Link href="/build">Builder</Link> is saved in your browser&apos;s local
				storage so you find it again when you come back. It is never sent to us and
				never leaves your device: clearing the site&apos;s data in your browser
				erases it for good.
			</p>
			<p>
				The same goes for images you add to a line yourself — your browser reads
				them locally and embeds them in the line, with no upload to a server.
			</p>

			<h2>3. The image rendering service</h2>
			<p>
				When you ask to download a line as an image, that line&apos;s content —
				including any custom images in it — is sent to our rendering service for as
				long as it takes to produce the PNG returned to you. The content is not
				kept after rendering, and it is tied to no identity because we hold none.
				If you would rather nothing left your browser, the code export is entirely
				local.
			</p>

			<h2>4. Audience measurement</h2>
			<p>
				We use Vercel Analytics, which counts page views without cookies, without
				advertising identifiers, and without building a profile of you. It does not
				track you across other websites.
			</p>

			<h2>5. Hosting</h2>
			<p>
				The site is served by Vercel&apos;s content delivery network from the
				location nearest to you. As with any web server, the one answering you sees
				your IP address for the duration of the request. Some monster artwork is
				loaded directly from external sources by your browser, which means those
				servers also see your IP address, as with any image on the web.
			</p>

			<h2>6. Why we are allowed to process it (EEA/UK visitors)</h2>
			<ul>
				<li>
					<strong>Aggregate analytics</strong> — legitimate interest in knowing
					whether the site works and is used, using data that does not identify
					you.
				</li>
				<li>
					<strong>Image rendering</strong> — performing the service you asked for:
					we cannot draw the image without receiving the line to draw.
				</li>
			</ul>

			<h2>7. How long we keep it</h2>
			<p>
				We keep no data about you. Content sent to the rendering service is
				processed and then discarded. Audience figures are aggregated and cannot be
				traced back to a visitor.
			</p>

			<h2>8. Your rights</h2>
			<p>
				You can ask us to access, correct, export, or delete your data, and object
				to its processing. Since we hold no account, there is in practice nothing on
				our side to extract or erase, but write to us on our{' '}
				<a href={DISCORD_URL} target="_blank" rel="noreferrer">
					Discord server
				</a>{' '}
				and we will answer within 30 days. If you are in the EEA and believe we
				have mishandled your data, you may lodge a complaint with your national
				data protection authority.
			</p>

			<h2>9. Children</h2>
			<p>
				The site is open to everyone and collects no sign-up data, therefore no data
				from children.
			</p>

			<h2>10. Third parties we rely on</h2>
			<ul>
				<li>
					<strong>Vercel</strong> — hosting, content delivery, and cookieless
					audience measurement.
				</li>
				<li>
					<strong>Our rendering service</strong> — generates line images, at your
					request.
				</li>
				<li>
					<strong>Ko-fi</strong> — donations, only if you choose to go there.
				</li>
			</ul>

			<h2>11. Changes</h2>
			<p>
				If we change this policy in a way that affects you, we will update the date
				at the top of this page and announce it on our Discord server.
			</p>

			<h2>12. Contact</h2>
			<p>
				<a href={DISCORD_URL} target="_blank" rel="noreferrer">
					Our Discord server
				</a>
			</p>

			<p className="mt-4">
				See also our <Link href="/terms">Terms of Service</Link>.
			</p>
		</Layout>
	);
};

export default PagePrivacy;
