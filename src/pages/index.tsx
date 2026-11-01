import React, { useEffect } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import GameCard from '@/components/GameCard';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import HeroGraph from '@/components/Home/HeroGraph';
import TrailMock from '@/components/Home/TrailMock';
import ReserveMock from '@/components/Home/ReserveMock';
import { gameHasTalentRecipes } from '@/components/SynthesisPage';
import { ImagesContext } from '@/context/images';
import { Game } from '@/types/Game';
import { Families } from '@/types/Monster';
import { StringObject } from '@/types/Ui';
import { games } from '@/functions/games';
import { pickImages } from '@/functions/images';
import useTranslate from '@/hooks/useTranslate';
import { DISCORD_URL, SITE_URL } from '@/consts/env';

const DEFAULT_GAME = 'DQM4';

const MOCK_MONSTERS = [
	'Metal Slime',
	'Liquid Metal Slime',
	'Metal King Slime',
	'Slime',
	'Slime Stack',
	'Gloomy Grublin',
	'Dracky',
	'Firespirit',
	'Slime Knight',
	'She-Slime',
	'Mottle Slime',
	'Healslime',
];

const seriesTitles: { [series: string]: string } = {
	monsters: 'Dragon Quest Monsters',
	joker: 'Dragon Quest Monsters: Joker',
};

const websiteJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: 'Dragon Quest Synthesis',
	alternateName: 'DQ Synths',
	url: `${SITE_URL}/`,
};

interface Stats {
	games: number;
	monsters: number;
	recipes: number;
}

interface Props {
	talentGames: Game[];
	stats: Stats;
	images: StringObject;
}

const PageHome: React.FC<Props> = ({
	talentGames = [],
	stats = { games: 0, monsters: 0, recipes: 0 },
	images = {},
}) => {
	const { isFr, translateUI, translateGame } = useTranslate();
	const t = (en: string, fr: string) => (isFr ? fr : en);
	const formatNumber = (value: number) =>
		value.toLocaleString(isFr ? 'fr-FR' : 'en-US');
	const formatSeries = (title: string) => (isFr ? title.replace(/ ?:/g, ' :') : title);
	const latestGame = games[DEFAULT_GAME];

	useEffect(() => {
		if (window.location.hash) {
			window.location.replace(`/game/${DEFAULT_GAME}${window.location.hash}`);
		}
	}, []);

	return (
		<Layout
			noGoBack
			noTitle
			title={translateUI('Dragon Quest Monsters synthesis')}
			metatitle="Dragon Quest Synthesis – Synthesis charts for every Dragon Quest Monsters game"
			fullMetatitle
			metadescription="Synthesis (breeding) charts for every Dragon Quest Monsters game, from Dragon Warrior Monsters to Joker 3 and The Dark Prince: each monster's recipe, what it synthesizes into, its skill sets and where to find it."
			className="home"
		>
			<Head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
				/>
			</Head>
			<ImagesContext.Provider value={images}>
				<section className="home-hero">
					<HeroGraph className="home-hero-graph" />
					<div className="home-hero-text">
						<h1 className="home-title">
							{t('Every synthesis of ', 'Toutes les synthèses des ')}
							<span className="home-title-accent">
								Dragon Quest Monsters
							</span>
							{t(' game', '')}
						</h1>
						<p className="home-lead">
							{t(
								'Find how to get any monster, follow its synthesis chain step by step, and see what you can already create with the monsters you own.',
								"Trouvez comment obtenir n'importe quel monstre, suivez sa chaîne de synthèses étape par étape et voyez ce que vous pouvez déjà créer avec vos monstres."
							)}
						</p>
					</div>
					<nav className="home-games" aria-label={translateUI('Games')}>
						<h2 className="home-games-title">
							{t('Pick your game', 'Choisissez votre jeu')}
						</h2>
						{Object.entries(seriesTitles).map(([series, seriesTitle]) => (
							<section key={series} className="home-series">
								<h3 className="home-series-title">
									{formatSeries(seriesTitle)}
								</h3>
								<div className="row">
									{Object.values(games)
										.filter(
											game =>
												game.available && game.series == series
										)
										.reverse()
										.map((game: Game) => (
											<div
												key={game.key}
												className="game-card-col col-6 col-sm-3 d-flex mb-2 mb-md-3"
											>
												<GameCard game={game} caption />
											</div>
										))}
								</div>
							</section>
						))}
					</nav>
				</section>

				<ul className="home-stats">
					<li>
						<b>{formatNumber(stats.games)}</b>
						<span>{t('games', 'jeux')}</span>
					</li>
					<li>
						<b>{formatNumber(stats.monsters)}</b>
						<span>{t('monster entries', 'fiches de monstres')}</span>
					</li>
					<li>
						<b>{formatNumber(stats.recipes)}</b>
						<span>{t('synthesis recipes', 'recettes de synthèse')}</span>
					</li>
				</ul>

				<section className="home-feature">
					<div className="home-feature-text">
						<p className="home-kicker">
							<Icon name="signpost-split" />{' '}
							{t('Synthesis trail', "Fil d'Ariane")}
						</p>
						<h2 className="home-feature-title">
							{t(
								'Never get lost in a synthesis chain',
								'Ne vous perdez plus dans les synthèses en chaîne'
							)}
						</h2>
						<p>
							{t(
								'Getting a high-rank monster often means synthesizing its parents first, then their own parents… Every parent you follow is added to the trail at the bottom of the screen.',
								"Obtenir un monstre de haut rang demande souvent de synthétiser d'abord ses parents, puis leurs propres parents… Chaque parent que vous suivez s'ajoute au fil d'Ariane en bas de l'écran."
							)}
						</p>
						<ul className="home-checks">
							<li>
								<Icon name="check2" />
								{t(
									'Jump back to any step in one click',
									"Revenez à n'importe quelle étape en un clic"
								)}
							</li>
							<li>
								<Icon name="check2" />
								{t(
									'Unfold the whole tree to see everything left to make',
									"Dépliez l'arbre complet pour voir tout ce qu'il reste à faire"
								)}
							</li>
							<li>
								<Icon name="check2" />
								{t(
									'Save it as an image to keep it at hand while you play',
									"Enregistrez-le en image pour l'avoir sous la main en jouant"
								)}
							</li>
						</ul>
					</div>
					<div className="home-feature-visual">
						<TrailMock />
					</div>
				</section>

				<section className="home-feature reverse">
					<div className="home-feature-text">
						<p className="home-kicker">
							<Icon name="box-seam" />{' '}
							{t('Reserve & goals', 'Réserve et objectifs')}
						</p>
						<h2 className="home-feature-title">
							{t(
								'Know what you can synthesize right now',
								'Sachez ce que vous pouvez synthétiser tout de suite'
							)}
						</h2>
						<p>
							{t(
								'Add the monsters you own to your reserve: the site works out every synthesis you can make with them, rank-ups first.',
								'Ajoutez vos monstres à la réserve : le site calcule toutes les synthèses possibles avec eux, montées de rang en premier.'
							)}
						</p>
						<ul className="home-checks">
							<li>
								<Icon name="check2" />
								{t(
									'Set synthesis goals and see at a glance which parents are still missing',
									"Fixez-vous des objectifs et voyez d'un coup d'œil les parents qui manquent encore"
								)}
							</li>
							<li>
								<Icon name="check2" />
								{t(
									'Possible syntheses sorted by rank gain',
									'Synthèses possibles triées par montée de rang'
								)}
							</li>
							<li>
								<Icon name="check2" />
								{t(
									'Saved in your browser, one reserve per game',
									'Sauvegardée dans votre navigateur, une réserve par jeu'
								)}
							</li>
						</ul>
					</div>
					<div className="home-feature-visual">
						<ReserveMock />
					</div>
				</section>

				<section className="home-more">
					<h2 className="home-more-title">{translateUI('More tools')}</h2>
					<div className="home-more-grid">
						<div className="home-more-card">
							<Icon name="search" className="home-more-icon" />
							<h3>{t('Search everything', 'Recherche complète')}</h3>
							<p>
								{t(
									'Look up a monster or a skill set, then filter by family and rank.',
									'Cherchez un monstre ou un talent, puis filtrez par famille et par rang.'
								)}
							</p>
						</div>
						{talentGames.length > 0 && (
							<div className="home-more-card">
								<Icon name="stars" className="home-more-icon" />
								<h3>{translateUI('Skill sets')}</h3>
								<p>
									{t(
										'Skill sets obtained by evolving or combining maxed skill sets.',
										'Les talents obtenus en faisant évoluer ou en combinant des talents maxés.'
									)}
								</p>
								<ul className="home-more-links">
									{talentGames.map(game => (
										<li key={game.key}>
											<Link
												href={`/game/${game.key}/talents`}
												title={translateGame(game)}
											>
												{game.key}
											</Link>
										</li>
									))}
								</ul>
							</div>
						)}
						<div className="home-more-card">
							<Icon name="card-list" className="home-more-icon" />
							<h3>{t('Monster details', 'Fiches détaillées')}</h3>
							<p>
								{t(
									'Stats, traits, resistances, skill sets and drops, depending on the game.',
									'Statistiques, traits, résistances, talents et objets, selon le jeu.'
								)}
							</p>
						</div>
						<div className="home-more-card">
							<Icon name="diagram-3" className="home-more-icon" />
							<h3>
								<Link href="/build">
									{translateUI('Synthesis tree builder')}
								</Link>
							</h3>
							<p>
								{t(
									'Draw your own synthesis tree and export it as an image.',
									'Construisez votre propre arbre de synthèse et exportez-le en image.'
								)}
							</p>
						</div>
						<div className="home-more-card">
							<Icon name="trophy" className="home-more-icon" />
							<h3>
								<Link href="/bosses">{translateUI('Bosses')}</Link>
							</h3>
							<p>
								{t(
									'The major bosses of the main Dragon Quest saga, from I to XI.',
									'Les boss majeurs de la saga principale Dragon Quest, de I à XI.'
								)}
							</p>
						</div>
						<div className="home-more-card">
							<Icon name="translate" className="home-more-icon" />
							<h3>{t('English & French', 'Français et anglais')}</h3>
							<p>
								{t(
									'Monster, skill and trait names in French, taken from the official games whenever possible.',
									'Noms des monstres, compétences et traits en français, repris des jeux officiels dès que possible.'
								)}
							</p>
						</div>
					</div>
				</section>

				<section className="home-cta">
					<h2>{t('Ready to synthesize?', 'Prêt à synthétiser ?')}</h2>
					<p>
						{t(
							'Start with the latest game, or join the community on Discord.',
							'Commencez par le dernier jeu, ou rejoignez la communauté sur Discord.'
						)}
					</p>
					<div className="home-cta-actions">
						<Link
							href={`/game/${DEFAULT_GAME}`}
							className="btn btn-primary btn-lg"
						>
							{translateGame(latestGame)} <Icon name="arrow-right" />
						</Link>
						<Link
							href={DISCORD_URL}
							target="_blank"
							rel="nofollow noopener noreferrer"
							className="btn btn-outline-light btn-lg"
						>
							<Icon name="discord" /> Discord
						</Link>
					</div>
				</section>
			</ImagesContext.Provider>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	const available = Object.values(games).filter(
		game => game.available && game.key != 'Custom'
	);
	const stats: Stats = { games: available.length, monsters: 0, recipes: 0 };
	available.forEach(game => {
		const families: Families = require(`../json/${game.key}.json`);
		Object.values(families).forEach(ranks =>
			Object.values(ranks).forEach(monsters =>
				monsters.forEach(monster => {
					stats.monsters++;
					stats.recipes += monster.synthesis?.length || 0;
				})
			)
		);
	});
	return {
		props: {
			talentGames: available.filter(game => gameHasTalentRecipes(game.key)),
			stats,
			images: pickImages(require('../json/monstersImages.json'), MOCK_MONSTERS),
		},
	};
};

export default PageHome;
