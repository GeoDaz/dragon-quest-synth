export interface MonsterDrop {
	item: string;
	rate: number;
	rare?: boolean;
}

export interface MonsterTraits {
	always?: string;
	level20?: string;
	level40?: string;
	largeAlways?: string[];
	largeLevel60?: string;
}

export interface MonsterStats {
	hp: number;
	mp: number;
	attack: number;
	defence: number;
	agility: number;
	wisdom: number;
}

export interface MonsterDetails {
	size?: string;
	egg: boolean;
	eggColor?: string;
	stats?: MonsterStats;
	resistances?: { [key: string]: number };
	traits?: MonsterTraits;
	skill?: string;
	randomSkills?: string[];
	scoutable?: boolean;
	drops?: MonsterDrop[];
}

export type MonstersDetails = { [name: string]: MonsterDetails };

export interface Localised {
	en?: string;
	fr?: string;
}

export interface Term extends Localised {
	desc?: Localised;
}

export type GameItems = { [japanese: string]: Localised };

export interface Spawn {
	area: string;
	time?: 'always' | 'day' | 'night';
	seasons?: string[];
	weathers?: string[];
}

export type GameSpawns = { [name: string]: Spawn[] };

export interface FarewellItem {
	item: string;
	rate: number;
}

export interface FarewellAmount {
	growth: number;
	count: number;
}

export interface GameFarewell {
	items: FarewellItem[];
	amounts: FarewellAmount[];
}

export interface GameTerms {
	traits: { [japanese: string]: Term };
	skills: { [japanese: string]: Term };
}
