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
