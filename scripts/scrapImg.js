const { fetchHtml, wait, readJson, writeJson } = require('./lib');

const src = './src/json/monsterList.json';
const dst = './src/json/monstersImages.json';
const families = readJson(src);
const current = readJson(dst);

const result = current || {};

const urls = [];
Object.values(families).forEach(async family => {
	Object.entries(family).forEach(async ([name, url]) => {
		if (!result[name]) {
			urls.push([name, url]);
		}
	});
});

scrapeImages();

async function scrapeImages() {
	try {
		for (let [name, url] of urls) {
			if (result[name]) continue;
			await scrapeImage(name, url);
			await wait(1000);
		}
	} catch (e) {
		console.log(e);
	}
	writeJson(dst, result);
}

// scrapeImage('Abyss diver', families['Aquatic family']['Abyss diver']);

async function scrapeImage(name, url) {
	const doc = await fetchHtml(url);
	if (!doc) {
		console.log(name, 'unfound');
		return;
	}

	const image = doc.querySelector(
		'.portable-infobox .image-thumbnail img'
	);
	if (image) {
		const src = image.src;
		let value;
		let substr = src.split('.png');
		if (substr.length === 1) {
			substr = src.split('.jpg');
			value = substr[0] + '.jpg';
		} else {
			value = substr[0] + '.png';
		}
		result[name] = value;
		console.log({ [name]: value });
	} else {
		console.log(name, 'img unfound');
	}
}
