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

export const seasonsIcons: StringObject = {
	Spring: 'flower2',
	Summer: 'thermometer-sun',
	Autumn: 'leaf',
	Winter: 'snow2',
};

export const weathersIcons: StringObject = {
	Clear: 'sun-fill',
	Rain: 'cloud-drizzle-fill',
	Snow: 'cloud-snow-fill',
	Blizzard: 'wind',
	Lightning: 'cloud-lightning-fill',
	Smog: 'cloud-haze-fill',
	'Acid Rain': 'cloud-hail-fill',
	'Candy Rain': 'cake2-fill',
	'Lava Shower': 'fire',
	'Star Shower': 'stars',
	'Blood Moon': 'transparency',
	'Spooky Night': 'cloud-moon-fill',
	SansStorm: 'tornado',
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
	Darkonium: 'Darkonium.png',
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
