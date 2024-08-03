const { writeJson, readJson, capitalize } = require('./lib');

const dst = './src/json/monsterTranslations.json';
const monsters = readJson(dst);
const exceptions = ['le', 'les', 'la', 'l', 'd', 'des', 'de', 'du', 'à', 'en', 'et'];

const monstersDst = Object.entries(monsters).reduce((acc, [name, trans]) => {
	acc[capitalize(name, exceptions)] = capitalize(trans, exceptions);
	return acc;
}, {});

writeJson(dst, monstersDst);
