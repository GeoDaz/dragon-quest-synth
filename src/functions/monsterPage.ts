import { Families, Monster } from '@/types/Monster';
import {
	GameFarewell,
	GameItems,
	GameSpawns,
	GameTalents,
	GameTerms,
	MonsterDetails,
	MonstersDetails,
	Spawn,
} from '@/types/MonsterDetails';
import { StringObject } from '@/types/Ui';
import { reverseSynth } from '@/functions/transformer/synthesis';
import { pickImages } from '@/functions/images';
import { monsterSlug } from '@/functions';
import { worldsOrder } from '@/consts/data';
import {
	gameDetails,
	gameFarewell,
	gameItems,
	gameSpawns,
	gameTalents,
	gameTerms,
} from '@/components/SynthesisPage';

const RELATED_LIMIT = 12;

interface GameData {
	monsters: Monster[];
	bySlug: { [slug: string]: Monster[] };
	details: MonstersDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
	spawns: GameSpawns;
	talents: GameTalents;
	hasSkills: boolean;
	hasSpawns: boolean;
}

const cache: { [game: string]: GameData } = {};

const loadGame = (game: string): GameData => {
	if (cache[game]) return cache[game];
	const families: Families = JSON.parse(
		JSON.stringify(require(`../json/${game}.json`))
	);
	reverseSynth(families);
	const monsters = Object.entries(families).flatMap(([, ranks]) =>
		Object.values(ranks).flat()
	);
	const bySlug: GameData['bySlug'] = {};
	monsters.forEach(monster => (bySlug[monsterSlug(monster.name)] ??= []).push(monster));
	const details = gameDetails(game);
	const spawns = gameSpawns(game);
	cache[game] = {
		monsters,
		bySlug,
		details,
		terms: gameTerms(game),
		farewell: gameFarewell(game),
		items: gameItems(game),
		spawns,
		talents: gameTalents(game, details),
		hasSkills: Object.values(details).some(
			detail => !!detail.skill || !!detail.skills?.length
		),
		hasSpawns: !!Object.keys(spawns).length,
	};
	return cache[game];
};

export const gameMonsterSlugs = (game: string): string[] =>
	Object.keys(loadGame(game).bySlug);

const skillsOf = (details?: MonsterDetails): string[] =>
	details?.skills || (details?.skill ? [details.skill] : []);

export interface MonsterPageData {
	entries: Monster[];
	images: StringObject;
	details: MonstersDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
	spawns: GameSpawns;
	talents: GameTalents;
	hasSkills: boolean;
	hasSpawns: boolean;
	related: string[];
}

export const monsterPageData = (game: string, slug: string): MonsterPageData | null => {
	const data = loadGame(game);
	const entries = data.bySlug[slug];
	if (!entries?.length) return null;
	const name = entries[0].name;
	const detail = data.details[name];
	const skills = skillsOf(detail);

	const talents: GameTalents = { talents: {}, moves: {} };
	skills.forEach(skill => {
		const talent = data.talents.talents[skill];
		if (!talent) return;
		talents.talents[skill] = talent;
		talent.moves.forEach(({ move }) => {
			if (data.talents.moves[move]) talents.moves[move] = data.talents.moves[move];
		});
	});

	const traitNames = new Set<string>([
		...(detail?.traits || []).map(trait => trait.name),
		...Object.values(talents.talents).flatMap(talent => [
			...(talent.traits || []),
			...talent.moves.map(({ move }) => move),
		]),
	]);
	const terms: GameTerms = { traits: {}, skills: {} };
	traitNames.forEach(trait => {
		if (data.terms.traits[trait]) terms.traits[trait] = data.terms.traits[trait];
	});
	skills.forEach(skill => {
		if (data.terms.skills[skill]) terms.skills[skill] = data.terms.skills[skill];
	});

	const items: GameItems = {};
	[...(detail?.drops || []).map(drop => drop.item), ...data.farewell.items.map(entry => entry.item)].forEach(
		item => {
			if (data.items[item]) items[item] = data.items[item];
		}
	);

	const main = entries[0];
	const related = data.monsters
		.filter(
			monster =>
				monster.name != name &&
				monster.family == main.family &&
				monster.rank == main.rank
		)
		.map(monster => monster.name)
		.filter((value, i, list) => list.indexOf(value) == i)
		.slice(0, RELATED_LIMIT);

	const names = new Set<string>([name, ...related]);
	entries.forEach(entry => {
		entry.synthesis.flat().forEach(token => names.add(token));
		entry.revSynthesis?.forEach(child => names.add(child));
	});

	return {
		entries,
		images: pickImages(require('../json/monstersImages.json'), names),
		details: detail ? { [name]: detail } : {},
		terms,
		farewell: data.farewell,
		items,
		spawns: data.spawns[name] ? { [name]: data.spawns[name] } : {},
		talents,
		hasSkills: data.hasSkills,
		hasSpawns: data.hasSpawns,
		related,
	};
};

export interface AreaMonster {
	name: string;
	spawn: Spawn;
	version?: string;
}

export interface GameArea {
	area: string;
	monsters: AreaMonster[];
}

export const gameHasAreas = (game: string): boolean => {
	try {
		return loadGame(game).hasSpawns;
	} catch {
		return false;
	}
};

const addedVersion = (entries: Monster[]): string | undefined =>
	entries.length && entries.every(entry => entry.version && entry.version != 'Non-Pro') ?
		entries[0].version
	:	undefined;

const areaProgress = (area: string, worlds: string[]): number[] => {
	const index = (world: string) => {
		const position = worlds.indexOf(world);
		return position < 0 ? worlds.length : position;
	};
	const cleared = area.match(/\(after clearing (.*)\)$/)?.[1];
	return [
		index(area.split(' : ')[0]),
		!cleared ? -1
		: cleared == 'the story' ? worlds.length + 1
		: index(cleared),
	];
};

export const gameAreasData = (game: string): { areas: GameArea[]; images: StringObject } => {
	const data = loadGame(game);
	const worlds = worldsOrder[game] || [];
	const areas: { [area: string]: AreaMonster[] } = {};
	Object.entries(data.spawns).forEach(([name, spawns]) => {
		const version = addedVersion(data.monsters.filter(monster => monster.name == name));
		spawns.forEach(spawn =>
			(areas[spawn.area] ??= []).push(version ? { name, spawn, version } : { name, spawn })
		);
	});
	return {
		areas: Object.entries(areas)
			.map(([area, monsters]) => ({ area, monsters, progress: areaProgress(area, worlds) }))
			.sort((a, b) => a.progress[0] - b.progress[0] || a.progress[1] - b.progress[1])
			.map(({ area, monsters }) => ({ area, monsters })),
		images: pickImages(require('../json/monstersImages.json'), Object.keys(data.spawns)),
	};
};
