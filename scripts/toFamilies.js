const { writeJson, readJson } = require('./lib');

const src = './src/json/ignored/DQMTDP-Monsters.json';
const dst = './src/json/DQMTDP.json';

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
		C: [],
		A: [],
		S: [],
		X: [],
	},
};

const families = Object.values(monsters).reduce((acc, monster) => {
	if (!acc[monster.family]) acc[monster.family] = {};
	if (!acc[monster.family][monster.rank]) acc[monster.family][monster.rank] = [];
	acc[monster.family][monster.rank].push(monster);
	return acc;
}, baseObject);

writeJson(dst, families);
