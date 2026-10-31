const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://dragon-quest-synth.com';
const JSON_DIR = path.join(__dirname, '..', 'src', 'json');
const OUTPUT = path.join(__dirname, '..', 'public', 'sitemap.xml');

const hasTalentRecipes = game => {
	const file = path.join(JSON_DIR, `${game}Moves.json`);
	if (!fs.existsSync(file)) return false;
	const data = JSON.parse(fs.readFileSync(file, 'utf8'));
	return Object.values(data.talents || {}).some(talent => !!talent.from?.length);
};

const games = Object.values(
	JSON.parse(fs.readFileSync(path.join(JSON_DIR, 'games.json'), 'utf8'))
).filter(game => game.available);

const pages = [
	['/', 1],
	...games.map(game => [`/game/${game.key}`, 0.9]),
	...games
		.filter(game => hasTalentRecipes(game.key))
		.map(game => [`/game/${game.key}/talents`, 0.7]),
	['/build', 0.5],
	['/bosses', 0.5],
	['/privacy', 0.1],
	['/terms', 0.1],
];

const xml = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	...pages.map(
		([page, priority]) =>
			`\t<url><loc>${SITE_URL}${page}</loc><priority>${priority}</priority></url>`
	),
	'</urlset>',
	'',
].join('\n');

fs.writeFileSync(OUTPUT, xml);
console.log(`sitemap.xml: ${pages.length} pages`);
