import { StringObject } from '@/types/Ui';

export const families: string[] = [
	'Slime',
	'Beast',
	'Dragon',
	'Nature',
	'Material',
	'Demon',
	'Undead',
	'???',
];
export const ranksIcons: StringObject = {
	X: 'X.png',
	S: 'S.png',
	A: 'A.png',
	B: 'B.png',
	C: 'C.png',
	D: 'D.png',
	E: 'E.png',
	F: 'F.png',
	G: 'G.png',
};

export const areasNames: StringObject = {
	KarekiPlain: 'Kareki Plain',
	KarekiWasteland: 'Kareki Wasteland',
	KarekiWetland: 'Kareki Wetland',
	KarekiCave: 'Kareki Cave',
	KarekiShrineB1F: 'Kareki Shrine B1F',
};

export const familiesIcons: StringObject = {
	Slime: 'Slime.png',
	Beast: 'Beast.png',
	Dragon: 'Dragon.png',
	Nature: 'Nature.png',
	// Plant: 'Nature.png',
	Material: 'Material.png',
	Demon: 'Demon.png',
	Undead: 'Undead.png',
	'???': 'Unknown.png',
	Aquatic: 'Aquatic.png',
	Reptile: 'Reptile.png',
	Dinosaur: 'Dinosaur.png',
	Food: 'Food.png',
	Dark: 'Dark.png',
};
// famillies can be in subfamilies
export const subfamilies: string[] = [
	...families,
	'Machine',
	'Elemental',
	'Plant',
	'Aquatic',
	'Bug',
	'Bird',
	'Humanoid',
	'Dragon',
	'Reptile',
	'Amphibian',
	'Fairy',
	'Character',
	'Wizard',
	'Warrior',
	'Food',
	'Ice',
	'Fire',
	'Metal',
	'Gold',
	'Dark',
	'Myth',
	'Space',
	'Jewel',
	'King',
	// 'Music',
	// 'bat',
	// 'golem',
];
