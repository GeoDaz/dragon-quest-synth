import { DEV } from '@/consts/env';
import { Game } from '@/types/Game';
import gamesJson from '@/json/games.json';

const CUSTOM_GAME: Game = {
	key: 'Custom',
	series: 'custom',
	title: 'Custom',
	available: true,
	ranks: ['X', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
};

export const games: Record<string, Game> =
	process.env.NODE_ENV === DEV ? { ...gamesJson, Custom: CUSTOM_GAME } : gamesJson;

export const gameTitle = (game: Game, isFr: boolean): string =>
	isFr ? (game.titleFr || game.title).replace(/ ?:/g, ' :') : game.title;

export const gameMetaDescription = (
	game: Game,
	count: number,
	hasSkills: boolean,
	hasSpawns: boolean,
	isFr = false
): string => {
	const title = gameTitle(game, isFr);
	const name = game.alias ? `${title} (${game.alias})` : title;
	if (isFr) {
		const parts = [
			'leurs recettes de synthèse',
			"les monstres qu'ils permettent d'obtenir",
			...(hasSkills ? ['leurs talents'] : []),
			...(hasSpawns ? ['leurs emplacements'] : []),
		];
		const last = parts.pop();
		return `${name} : table des synthèses avec les ${count} monstres, ${parts.join(', ')} et ${last}. Recherche par nom, famille ou rang.`;
	}
	const parts = [
		'synthesis (breeding) recipes',
		'what they synthesize into',
		...(hasSkills ? ['skill sets'] : []),
		...(hasSpawns ? ['locations'] : []),
	];
	const last = parts.pop();
	return `${name} synthesis chart: all ${count} monsters with their ${parts.join(', ')} and ${last}. Search by name, family or rank.`;
};
