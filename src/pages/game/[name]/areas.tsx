import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import GameHeader from '@/components/GameHeader';
import ScrollUp from '@/components/ScrollUp';
import MonsterImg from '@/components/Monster/MonsterImg';
import { SpawnWhen, TIME_ICONS, TIME_LABELS } from '@/components/Monster/MonsterRow';
import { gameHasTalentRecipes } from '@/components/SynthesisPage';
import { ImagesContext } from '@/context/images';
import { gameAreasData, gameHasAreas, GameArea } from '@/functions/monsterPage';
import { games } from '@/functions/games';
import { monsterPath } from '@/functions';
import { areasNames, seasonsIcons, weathersIcons } from '@/consts/data';
import useTranslate from '@/hooks/useTranslate';
import { Game } from '@/types/Game';
import { StringObject } from '@/types/Ui';

interface Props {
	game: Game;
	areas: GameArea[];
	images: StringObject;
	hasTalents: boolean;
	areaGames: string[];
}

const splitArea = (area: string) => {
	const name = areasNames[area] || area;
	const index = name.indexOf(' : ');
	return index < 0 ? [name, ''] : [name.slice(0, index), name.slice(index + 3)];
};

const PageAreas: React.FC<Props> = ({ game, areas, images, hasTalents, areaGames }) => {
	const { isFr, translateArea, translateGame, translateUI } = useTranslate();
	const t = (en: string, fr: string) => (isFr ? fr : en);
	const title = translateGame(game);

	const groups: { world: string; areas: GameArea[] }[] = [];
	areas.forEach(area => {
		const [world] = splitArea(area.area);
		const group = groups.find(item => item.world == world);
		if (group) group.areas.push(area);
		else groups.push({ world, areas: [area] });
	});

	return (
		<Layout
			noGoBack
			title={
				<>
					{translateUI('Areas')} {title}
				</>
			}
			metatitle={t(`${title} – Areas and monsters`, `${title} – Lieux et monstres`)}
			metadescription={t(
				`Every area of ${title} with the monsters you can meet there, and when: time of day, seasons and weather.`,
				`Tous les lieux de ${title} avec les monstres qu’on peut y rencontrer, et quand : moment de la journée, saisons et météo.`
			)}
			className="overflow-visible"
		>
			<ScrollUp />
			<GameHeader
				game={game}
				active="areas"
				hasTalents={hasTalents}
				hasAreas
				cardHref={_game =>
					areaGames.includes(_game.key) ? `/game/${_game.key}/areas` : undefined
				}
			/>
			<div className="monster-page">
				<ImagesContext.Provider value={images}>
					{groups.map(group => (
						<section key={group.world} className="monster-section">
							<h2>{translateArea(group.world)}</h2>
							{group.areas.map(area => (
								<AreaBlock key={area.area} area={area} game={game.key} />
							))}
						</section>
					))}
				</ImagesContext.Provider>
			</div>
		</Layout>
	);
};

const AreaBlock = ({ area, game }: { area: GameArea; game: string }) => {
	const { isFr, translateArea, translateMonster, translateUI } = useTranslate();
	const [, part] = splitArea(area.area);
	const weathers = Array.from(
		new Set(area.monsters.flatMap(({ spawn }) => spawn.weathers || []))
	);
	const seasons = Array.from(
		new Set(area.monsters.flatMap(({ spawn }) => spawn.seasons || []))
	);
	return (
		<div className="area-block">
			{!!part && <h3>{translateArea(part)}</h3>}
			{seasons.length > 0 && (
				<p className="area-weathers">
					<span className="monster-label">{isFr ? 'Saisons' : 'Seasons'}</span>
					{seasons.map(season => (
						<span key={season} className="area-weather">
							<Icon name={seasonsIcons[season]} /> {translateUI(season)}
						</span>
					))}
				</p>
			)}
			{weathers.length > 0 && (
				<p className="area-weathers">
					<span className="monster-label">{isFr ? 'Météo' : 'Weather'}</span>
					{weathers.map(weather => (
						<span key={weather} className="area-weather">
							<Icon name={weathersIcons[weather]} /> {translateUI(weather)}
						</span>
					))}
				</p>
			)}
			<ul className="monster-tiles">
				{area.monsters.map(({ name, spawn, version }, i) => (
					<li key={`${name}-${i}`}>
						<Link href={monsterPath(game, name)} className="monster-tile-link">
							<span className="into-tile line-point pictured">
								<MonsterImg name={name} small title={translateMonster(name)} />
							</span>
							<span className="monster-tile-name">
									{translateMonster(name)}
									{version && <span className="monster-version"> ({version})</span>}
								</span>
						</Link>
						{(!!spawn.time || !!spawn.seasons?.length || !!spawn.weathers?.length) && (
							<span className="area-conditions">
								{!!spawn.time && (
									<Icon
										name={TIME_ICONS[spawn.time]}
										title={translateUI(TIME_LABELS[spawn.time])}
									/>
								)}
								<SpawnWhen
									label={translateUI('Season')}
									values={spawn.seasons}
									icons={seasonsIcons}
								/>
								<SpawnWhen
									label={translateUI('Weather')}
									values={spawn.weathers}
									icons={weathersIcons}
								/>
							</span>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export const getStaticPaths: GetStaticPaths = async ({ locales = [] }) => ({
	paths: Object.values(games)
		.filter((game: Game) => game.available && gameHasAreas(game.key))
		.flatMap((game: Game) =>
			locales.map(locale => ({ params: { name: game.key }, locale }))
		),
	fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const game = games[params?.name as string];
	if (!game?.available || !gameHasAreas(game.key)) return { notFound: true };
	return {
		props: {
			game,
			hasTalents: gameHasTalentRecipes(game.key),
			areaGames: Object.values(games)
				.filter(_game => _game.available && gameHasAreas(_game.key))
				.map(_game => _game.key),
			...gameAreasData(game.key),
		},
	};
};

export default PageAreas;
