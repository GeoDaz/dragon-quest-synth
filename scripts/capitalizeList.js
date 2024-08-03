const { writeJson, readJson } = require('./lib');

const dst = './src/json/monsterList.json';
const dst2 = './src/json/monstersImages.json';

const monsters = readJson(dst);
const images = readJson(dst2);

const monstersDst = Object.entries(monsters).reduce((acc, [family, list]) => {
	acc[family] = Object.entries(list).reduce((acc2, [name, url]) => {
		acc2[capitalize(name)] = url;
		return acc2;
	}, {});
	return acc;
}, {});

const imagesDst = Object.entries(images).reduce((acc, [name, img]) => {
	acc[capitalize(name)] = img;
	return acc;
}, {});

writeJson(dst, monstersDst);
writeJson(dst2, imagesDst);
