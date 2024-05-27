import { Legend, StringObject } from '@/types/Ui';

export const colors: StringObject = {
	default: '#fff', //white // '#bdc3d1', // grey
	fusion: '#a054b9', // purple '#a333c8'
	mode: '#ef6e33', // orange
	gold: '#e4c05c', // gold '#E9DA1D'
	human: '#F966DE', // pink
	dark: '#6435c9', // violet '#684399' // black #000 ,
	light: '#fffd8d', // light yellow
	ice: '#87C7C6', // light blue
	fire: '#db2828', // red
	grass: '#21ba45', // green
	marine: '#0080ff', // marine blue
	electric: '#c0e617', // yellow
	wind: '#92f5c4', // yellow
	earth: '#a46204', // yellow
	machine: '#909090', // yellow
	// psychic: '#a24795', // fushia
};

export const familiesColors: StringObject = {
	Slime: '#2d95de', // blue
	Dragon: '#e4637e', // red
	Beast: '#955339', // brown
	Nature: '#47b82b', // green
	Material: '#676767', // grey
	Demon: '#b130b0', // purple
	Undead: '#434345', // black
	'???': '#ebb918', // gold
};

export const legend: Legend[] = [
	{ key: 'default', color: colors.default, text: 'Default color' },
	{
		key: 'dark',
		color: colors.dark,
		text: 'Dark, death, black, chaos, demon, ... evolution',
	},
	{ key: 'fusion', color: colors.fusion, text: 'Fusion' },
	{ key: 'mode', color: colors.mode, text: 'Mode change' },
	{ key: 'human', color: colors.human, text: 'From a human' },
	{ key: 'gold', color: colors.gold, text: 'Gold monster' },
	{ key: 'light', color: colors.light, text: 'Holy, angel evolution' },
	{ key: 'fire', color: colors.fire, text: 'Fire, lava made monster' },
	{ key: 'ice', color: colors.ice, text: 'Ice, snow made monster' },
	{ key: 'marine', color: colors.marine, text: 'Marine monster' },
	{ key: 'wind', color: colors.wind, text: 'Aerial, wind master monster' },
	{ key: 'earth', color: colors.earth, text: 'Earth, rock monster' },
	{ key: 'grass', color: colors.grass, text: 'Grass made monster' },
	{ key: 'electric', color: colors.electric, text: 'Thunder, electric monster' },
	{ key: 'machine', color: colors.machine, text: 'Machine, metal made monster' },
];
export default colors;
