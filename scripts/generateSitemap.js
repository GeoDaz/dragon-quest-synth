const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = 'https://dragon-quest-synth.com';
const ROOT = path.join(__dirname, '..');
const JSON_DIR = path.join(ROOT, 'src', 'json');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const OUTPUT = path.join(ROOT, 'public', 'sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);

const gitDate = (files = []) => {
	try {
		const args = files.map(file => `"${path.relative(ROOT, file)}"`).join(' ');
		const date = execSync(`git log -1 --format=%cs -- ${args}`, {
			cwd: ROOT,
			stdio: ['ignore', 'pipe', 'ignore'],
		})
			.toString()
			.trim();
		return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
	} catch {
		return null;
	}
};

const REPO_DATE = gitDate() || TODAY;

const gameFiles = game =>
	fs
		.readdirSync(JSON_DIR)
		.filter(
			file =>
				file == `${game}.json` || new RegExp(`^${game}[A-Z]\\w*\\.json$`).test(file)
		)
		.map(file => path.join(JSON_DIR, file));

const gameDates = {};
const gameDate = game => (gameDates[game] ??= gitDate(gameFiles(game)) || REPO_DATE);

const pageDate = file => gitDate([path.join(PAGES_DIR, file)]) || REPO_DATE;

const hasTalentRecipes = game => {
	const file = path.join(JSON_DIR, `${game}Moves.json`);
	if (!fs.existsSync(file)) return false;
	const data = JSON.parse(fs.readFileSync(file, 'utf8'));
	return Object.values(data.talents || {}).some(talent => !!talent.from?.length);
};

const monsterSlug = name =>
	name
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const monsterSlugs = game => {
	const families = JSON.parse(fs.readFileSync(path.join(JSON_DIR, `${game}.json`), 'utf8'));
	const names = Object.values(families).flatMap(ranks =>
		Object.values(ranks).flatMap(monsters => monsters.map(monster => monster.name))
	);
	return [...new Set(names.map(monsterSlug))];
};

const hasAreas = game => {
	const file = path.join(JSON_DIR, `${game}Spawns.json`);
	return fs.existsSync(file) && Object.keys(JSON.parse(fs.readFileSync(file, 'utf8'))).length > 0;
};

const games = Object.values(
	JSON.parse(fs.readFileSync(path.join(JSON_DIR, 'games.json'), 'utf8'))
).filter(game => game.available);

const pages = [
	['/', 1, pageDate('index.tsx')],
	...games.map(game => [`/game/${game.key}`, 0.9, gameDate(game.key)]),
	...games
		.filter(game => hasAreas(game.key))
		.map(game => [`/game/${game.key}/areas`, 0.7, gameDate(game.key)]),
	...games
		.filter(game => hasTalentRecipes(game.key))
		.map(game => [`/game/${game.key}/talents`, 0.7, gameDate(game.key)]),
	...games.flatMap(game =>
		monsterSlugs(game.key).map(slug => [
			`/game/${game.key}/monster/${slug}`,
			0.6,
			gameDate(game.key),
		])
	),
	['/build', 0.5, pageDate('build.tsx')],
	['/bosses', 0.5, pageDate('bosses.tsx')],
	['/privacy', 0.1, pageDate('privacy.tsx')],
	['/terms', 0.1, pageDate('terms.tsx')],
];

const localized = pages.flatMap(([page, priority, lastmod]) => [
	[page, priority, lastmod],
	[page == '/' ? '/fr' : `/fr${page}`, priority, lastmod],
]);

const xml = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	...localized.map(
		([page, priority, lastmod]) =>
			`\t<url><loc>${SITE_URL}${page}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`
	),
	'</urlset>',
	'',
].join('\n');

fs.writeFileSync(OUTPUT, xml);
console.log(`sitemap.xml: ${localized.length} pages`);
