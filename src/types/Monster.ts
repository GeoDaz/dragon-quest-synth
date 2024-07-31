export interface Monster {
	name: string;
	nom?: string;
	rank: string;
	img: string;
	family: string;
	to?: string;
	subfamily?: string[];
	synthesis: string[][];
	revSynthesis: string[];
}

export type Monsters = { [key: string]: Monster };
export type Families = { [key: string]: { [key: string]: Monster[] } };
