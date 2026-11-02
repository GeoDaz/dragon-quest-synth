import React, { Fragment, useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import Family from '@/components/Monster/Family';
import Rank from '@/components/Monster/Rank';
import Egg from '@/components/Monster/Egg';
import Talent from '@/components/Monster/Talent';
import MonsterImg from '@/components/Monster/MonsterImg';
import { ParentChip, SpawnChip, parseRecipe } from '@/components/Monster/MonsterRow';
import { MonsterDetailsBody } from '@/components/Monster/MonsterDetailsModal';
import { DetailsContext } from '@/context/details';
import { ImagesContext } from '@/context/images';
import { MonsterLinkContext } from '@/context/monsterLink';
import { gameMonsterSlugs, monsterPageData, MonsterPageData } from '@/functions/monsterPage';
import { games } from '@/functions/games';
import { monsterPath } from '@/functions';
import useTranslate from '@/hooks/useTranslate';
import { SITE_URL } from '@/consts/env';
import { Game } from '@/types/Game';
import { Monster } from '@/types/Monster';

interface Props extends MonsterPageData {
	game: Game;
}

const skillsOf = (props: Props, name: string) =>
	props.details[name]?.skills ||
	(props.details[name]?.skill ? [props.details[name].skill as string] : []);

const PageMonster: React.FC<Props> = props => {
	const { game, entries, images, related } = props;
	const { locale } = useRouter();
	const { isFr, translateMonster, translateUI, translateGame } = useTranslate();
	const t = (en: string, fr: string) => (isFr ? fr : en);
	const main = entries[0];
	const name = translateMonster(main.name);
	const gameName = translateGame(game);
	const family = translateUI(main.family);
	const skills = skillsOf(props, main.name);
	const places = props.spawns[main.name] || [];
	const recipes = entries.reduce((sum, entry) => sum + entry.synthesis.length, 0);
	const children = Array.from(new Set(entries.flatMap(entry => entry.revSynthesis || [])));
	const localePrefix = locale == 'fr' ? '/fr' : '';

	const detailsValue = useMemo(
		() => ({
			details: props.details,
			terms: props.terms,
			farewell: props.farewell,
			items: props.items,
			spawns: props.spawns,
			talents: props.talents,
			hasDetails: !!props.details[main.name],
			hasSkills: props.hasSkills,
			hasSpawns: props.hasSpawns,
		}),
		[props, main.name]
	);

	const summary =
		isFr ?
			`${name} est un monstre de la famille ${family} de rang ${main.rank} dans ${gameName}. ${
				recipes ?
					`Il s’obtient par synthèse de ${recipes} façon${recipes > 1 ? 's' : ''}`
				:	'Il ne s’obtient pas par synthèse'
			}${
				children.length ?
					` et permet d’obtenir ${children.length} monstre${children.length > 1 ? 's' : ''}.`
				:	'.'
			}`
		:	`${name} is a rank ${main.rank} ${family} monster in ${gameName}. ${
				recipes ?
					`It can be synthesized in ${recipes} way${recipes > 1 ? 's' : ''}`
				:	'It cannot be obtained by synthesis'
			}${
				children.length ?
					` and is used to synthesize ${children.length} monster${children.length > 1 ? 's' : ''}.`
				:	'.'
			}`;

	const metadescription =
		isFr ?
			`Comment obtenir ${name} dans ${gameName} : monstre ${family} de rang ${main.rank}, ${recipes} recette${recipes > 1 ? 's' : ''} de synthèse, les ${children.length} monstres qu’il permet d’obtenir${skills.length ? ', son talent' : ''}${places.length ? ' et où le trouver' : ''}.`
		:	`How to get ${name} in ${gameName}: rank ${main.rank} ${family} monster, ${recipes} synthesis recipe${recipes > 1 ? 's' : ''}, the ${children.length} monsters it synthesizes into${skills.length ? ', its skill set' : ''}${places.length ? ' and where to find it' : ''}.`;

	const breadcrumb = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ name: 'Dragon Quest Synthesis', path: '' },
			{ name: gameName, path: `/game/${game.key}` },
			{ name, path: monsterPath(game.key, main.name) },
		].map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: `${SITE_URL}${localePrefix}${item.path}`,
		})),
	};

	return (
		<Layout
			noTitle
			title={name}
			metatitle={t(
				`${name} (${game.key}) – Synthesis recipe`,
				`${name} (${game.key}) – Recette de synthèse`
			)}
			metadescription={metadescription}
			className="monster-page"
		>
			<Head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
				/>
			</Head>
			<nav className="monster-breadcrumb" aria-label={t('Breadcrumb', 'Fil d’Ariane')}>
				<Link href="/">{t('Home', 'Accueil')}</Link>
				<Icon name="chevron-right" />
				<Link href={`/game/${game.key}`}>{gameName}</Link>
				<Icon name="chevron-right" />
				<span aria-current="page">{name}</span>
			</nav>
			<h1>{name}</h1>
			<ImagesContext.Provider value={images}>
				<DetailsContext.Provider value={detailsValue}>
					<MonsterLinkContext.Provider value={game.key}>
						{entries.map((entry, i) => (
							<MonsterEntry
								key={i}
								entry={entry}
								game={game}
								summary={i == 0 ? summary : undefined}
								skills={skillsOf(props, entry.name)}
							/>
						))}
						{places.length > 0 && (
							<section className="monster-section">
								<h2>{t(`Where to find ${name}`, `Où trouver ${name}`)}</h2>
								<div className="monster-spawns">
									{places.map(place => (
										<SpawnChip key={place.area} spawn={place} />
									))}
								</div>
							</section>
						)}
						{!!props.details[main.name] && (
							<section className="monster-section">
								<h2>{t('Details', 'Détails')}</h2>
								<MonsterDetailsBody
									details={props.details[main.name]}
									terms={props.terms}
									farewell={props.farewell}
									items={props.items}
								/>
							</section>
						)}
						{related.length > 0 && (
							<section className="monster-section">
								<h2>
									{t(
										`Other rank ${main.rank} ${family} monsters`,
										`Autres monstres ${family} de rang ${main.rank}`
									)}
								</h2>
								<MonsterTiles names={related} game={game.key} />
							</section>
						)}
					</MonsterLinkContext.Provider>
				</DetailsContext.Provider>
			</ImagesContext.Provider>
		</Layout>
	);
};

const MonsterEntry = ({
	entry,
	game,
	summary,
	skills,
}: {
	entry: Monster;
	game: Game;
	summary?: string;
	skills: string[];
}) => {
	const { isFr, translateMonster, translateUI } = useTranslate();
	const t = (en: string, fr: string) => (isFr ? fr : en);
	const name = translateMonster(entry.name);
	return (
		<>
			<section className="monster-hero">
				<div className="monster-tile line-point pictured">
					<MonsterImg name={entry.name} title={name} expandable />
				</div>
				<div className="monster-hero-text">
					{entry.version && <p className="monster-version">({entry.version})</p>}
					<div className="monster-hero-tags">
						<Family name={entry.family} />
						{!!entry.to && <Family name={entry.to} />}
						{entry.subfamily?.map(subfamily => (
							<Family key={subfamily} name={subfamily} />
						))}
						<Rank name={entry.rank} big />
					</div>
					{!!summary && <p className="monster-summary">{summary}</p>}
					{skills.length > 0 && (
						<div className="monster-skills">
							<span className="monster-label">{translateUI('Skill set')}</span>
							{skills.map(skill => (
								<Talent key={skill} name={skill} />
							))}
						</div>
					)}
					<Link href={`/game/${game.key}#${entry.name}`} className="btn btn-outline-primary btn-sm">
						<Icon name="table" /> {t('See it in the synthesis chart', 'Voir dans la table des synthèses')}
					</Link>
				</div>
			</section>
			<section className="monster-section">
				<h2>{t(`How to get ${name}`, `Comment obtenir ${name}`)}</h2>
				{entry.synthesis.length > 0 || entry.egg ?
					<div className="monster-recipes">
						{entry.synthesis.map((list, i) => (
							<Fragment key={i}>
								{i > 0 && (
									<div className="recipe-alt">
										&mdash; {translateUI('Or')} &mdash;
									</div>
								)}
								<div className="recipe">
									{parseRecipe(list).map((parent, j) => (
										<ParentChip
											key={j}
											parent={parent}
											child={entry.name}
											recipe={list}
										/>
									))}
								</div>
							</Fragment>
						))}
						{!!entry.egg && (
							<div className="recipe">
								<span className="parent-chip egg-chip">
									<Egg name={entry.egg} />
									<span className="chip-label">
										{translateUI('Egg')} {translateUI(entry.egg)}
									</span>
								</span>
							</div>
						)}
					</div>
				:	<p className="cell-empty">
						{t('No synthesis gives this monster.', 'Aucune synthèse ne donne ce monstre.')}
					</p>
				}
			</section>
			<section className="monster-section">
				<h2>{t(`What ${name} synthesizes into`, `Ce que ${name} permet d’obtenir`)}</h2>
				{entry.revSynthesis?.length ?
					<MonsterTiles names={entry.revSynthesis} game={game.key} />
				:	<p className="cell-empty">
						{t('This monster is not used in any synthesis.', 'Ce monstre n’entre dans aucune synthèse.')}
					</p>
				}
			</section>
		</>
	);
};

const MonsterTiles = ({ names, game }: { names: string[]; game: string }) => {
	const { translateMonster } = useTranslate();
	return (
		<ul className="monster-tiles">
			{names.map(name => (
				<li key={name}>
					<Link href={monsterPath(game, name)} className="monster-tile-link">
						<span className="into-tile line-point pictured">
							<MonsterImg name={name} small title={translateMonster(name)} />
						</span>
						<span className="monster-tile-name">{translateMonster(name)}</span>
					</Link>
				</li>
			))}
		</ul>
	);
};

export const getStaticPaths: GetStaticPaths = async ({ locales = [] }) => {
	const paths = Object.values(games)
		.filter((game: Game) => game.available)
		.flatMap((game: Game) => {
			try {
				return gameMonsterSlugs(game.key).map(monster => ({
					params: { name: game.key, monster },
				}));
			} catch {
				return [];
			}
		})
		.flatMap(path => locales.map(locale => ({ ...path, locale })));
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const game = games[params?.name as string];
	if (!game?.available) return { notFound: true };
	const data = monsterPageData(game.key, params?.monster as string);
	if (!data) return { notFound: true };
	return { props: { game, ...data } };
};

export default PageMonster;
