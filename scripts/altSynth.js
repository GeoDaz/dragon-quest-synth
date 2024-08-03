const { writeJson, readJson, capitalize } = require('./lib');

let translations = readJson('./src/json/monsterTranslations.json');
const src = './src/json/missing-alt-synthesis.json';
const dst = './src/json/DQM3-Monsters.json';
const exceptions = ['le', 'les', 'la', 'l', 'd', 'des', 'de', 'du', 'à', 'en', 'et'];

const monstersDst = readJson(dst);
const monsters = readJson(src);
translations = Object.entries(translations).reduce((acc, [name, nom]) => {
	acc[nom] = name;
	return acc;
}, {});

Object.entries(monsters).forEach(([name, value]) => {
	const nom = capitalize(name, exceptions);
	if (monstersDst[translations[nom]]) {
		monstersDst[translations[nom]].synthesis.push(value.synthesis);
	} else {
		console.error(`Missing ${nom} : ${translations[nom]}`);
	}
});

writeJson(dst, monstersDst);
