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

export const gameMetaDescription = (
	game: Game,
	count: number,
	hasSkills: boolean,
	hasSpawns: boolean
): string => {
	const name = game.alias ? `${game.title} (${game.alias})` : game.title;
	const parts = [
		'synthesis (breeding) recipes',
		'what they synthesize into',
		...(hasSkills ? ['skill sets'] : []),
		...(hasSpawns ? ['locations'] : []),
	];
	const last = parts.pop();
	return `${name} synthesis chart: all ${count} monsters with their ${parts.join(', ')} and ${last}. Search by name, family or rank.`;
};
