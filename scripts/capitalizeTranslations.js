const { writeJson, readJson } = require('./lib');

const capitalize = (string, char = ' ') => {
	let strings = string.split(char);
	strings = strings.map(
		string => string[0].toUpperCase() + string.slice(1) /* .toLowerCase() */
	);
	return strings.join(char);
};

const dst = './src/json/monsterTranslations.json';
const monsters = readJson(dst);

// TODO exception : le, les, la, l', d', des, de, du, à, en, et

const monstersDst = Object.entries(monsters).reduce((acc, [name, trans]) => {
	acc[capitalize(capitalize(name), '-')] = capitalize(
		capitalize(capitalize(trans), "'"),
		'-'
	);
	return acc;
}, {});

writeJson(dst, monstersDst);
