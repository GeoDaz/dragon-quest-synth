const { writeJson, readJson } = require('./lib');

const src = './src/json/DQM3-Monsters.json';
const dst = './src/json/DQM3-Families.json';

const monsters = readJson(src);

const baseObject = {
	Slime: {
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
		S: [],
	},
	Dragon: {
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
		S: [],
		X: [],
	},
	Beast: {
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
		S: [],
	},
	Nature: {
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
		S: [],
		X: [],
	},
	Material: {
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
		S: [],
	},
	Demon: {
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
		S: [],
	},
	Undead: {
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
		S: [],
	},
	'???': {
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
		S: [],
		X: [],
		Z: [],
	},
};

const families = Object.values(monsters).reduce((acc, monster) => {
	if (!acc[monster.family]) acc[monster.family] = {};
	if (!acc[monster.family][monster.rank]) acc[monster.family][monster.rank] = [];
	acc[monster.family][monster.rank].push(monster.name);
	return acc;
}, baseObject);

writeJson(dst, families);
