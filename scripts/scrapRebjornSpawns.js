const fs = require('fs');
const os = require('os');
const path = require('path');
const { JSDOM } = require('jsdom');
const { wait } = require('./lib');

const SITE = 'https://rebjorn-wiki.com';
const JSON_DIR = path.join(__dirname, '..', 'src', 'json');
const CACHE_DIR = path.join(os.tmpdir(), 'rebjorn-cache');
const DELAY = 400;

const GAMES = [
	{ key: 'DQMJ1', slug: 'dqmj' },
	{ key: 'DQMJ2', slug: 'dqmj2' },
];

const RENAMES = {};

const normalize = name =>
	name
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');

const fetchPage = async url => {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	const file = path.join(CACHE_DIR, url.replace(/[^a-z0-9]+/gi, '_') + '.html');
	if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
	await wait(DELAY);
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${response.status} ${url}`);
	const html = await response.text();
	fs.writeFileSync(file, html);
	return html;
};

const documentOf = html => new JSDOM(html).window.document;

const text = node => node?.textContent.replace(/\s+/g, ' ').trim() || '';

const ourNames = key => {
	const families = JSON.parse(fs.readFileSync(path.join(JSON_DIR, `${key}.json`), 'utf8'));
	const names = Object.values(families).flatMap(ranks =>
		Object.values(ranks).flatMap(monsters => monsters.map(monster => monster.name))
	);
	return new Map(names.map(name => [normalize(name), name]));
};

const parseHabitats = document =>
	[...document.querySelectorAll('.habitats-grid .card')].map(card => ({
		area: text(card.querySelector('.habitat-name')),
		times: [...card.querySelectorAll('.chip-time')].map(text),
		weathers: [...card.querySelectorAll('.chip-weather')].map(text),
	}));

const toSpawns = habitats => {
	const byArea = new Map();
	habitats.forEach(({ area, times, weathers }) => {
		const entry = byArea.get(area) || { area, times: new Set(), weathers: new Set() };
		times.forEach(time => entry.times.add(time.toLowerCase()));
		weathers.forEach(weather => entry.weathers.add(weather));
		byArea.set(area, entry);
	});
	return [...byArea.values()].map(({ area, times, weathers }) => {
		const spawn = { area };
		if (times.has('day') && times.has('night')) spawn.time = 'always';
		else if (times.has('day')) spawn.time = 'day';
		else if (times.has('night')) spawn.time = 'night';
		if (weathers.size) spawn.weathers = [...weathers];
		return spawn;
	});
};

const stringify = data =>
	JSON.stringify(data, null, '\t').replace(
		/\[\s+((?:"[^"]*",?\s*)+)\]/g,
		(_, items) => `[${items.trim().split(/,\s*/).join(', ')}]`
	) + '\n';

const run = async () => {
	for (const { key, slug } of GAMES) {
		const names = ourNames(key);
		const list = documentOf(await fetchPage(`${SITE}/${slug}/monsters?lang=en`));
		const links = [
			...new Set(
				[...list.querySelectorAll(`[data-href^="/${slug}/monsters/"]`)].map(row =>
					row.getAttribute('data-href').split(/[?#]/)[0]
				)
			),
		];
		const spawns = {};
		const unmatched = [];
		for (const link of links) {
			const document = documentOf(await fetchPage(`${SITE}${link}?lang=en`));
			const habitats = parseHabitats(document);
			if (!habitats.length) continue;
			const rebjornName = text(document.querySelector('h1'));
			const name =
				RENAMES[rebjornName] ||
				names.get(normalize(rebjornName)) ||
				names.get(normalize(link.split('/').pop()));
			if (!name) {
				unmatched.push(`${rebjornName} (${link})`);
				continue;
			}
			spawns[name] = toSpawns(habitats);
		}
		fs.writeFileSync(path.join(JSON_DIR, `${key}Spawns.json`), stringify(spawns));
		console.log(`${key}: ${Object.keys(spawns).length} monsters with habitats`);
		if (unmatched.length) console.log(`${key} unmatched:\n  ${unmatched.join('\n  ')}`);
	}
};

run().catch(error => {
	console.error(error);
	process.exit(1);
});
