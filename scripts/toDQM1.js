const fs = require('fs');
const { JSDOM } = require('jsdom');
const { writeJson } = require('./lib');

const src = './src/json/ignored/DQM1-monsters.html';
const dst = './src/json/DQM1.json';

const doc = new JSDOM(fs.readFileSync(src, 'utf8')).window.document;
const cellText = td => {
	const h = td.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p)>/gi, '\n');
	const t = doc.createElement('div');
	t.innerHTML = h;
	return t.textContent.replace(/\n{2,}/g, '\n').trim();
};
const rows = [...doc.querySelector('table').querySelectorAll('tr')].map(tr =>
	[...tr.querySelectorAll('td,th')].map(cellText)
);
const data = rows.filter((r, i) => i > 1 && r[2] && r[2] !== 'Name');

// DQM1 (Terry's Wonderland 3D) families -> app canonical naming (same as DQM2)
const familyMap = { Devil: 'Demon', Zombie: 'Undead', Special: '???' };
const mapFamily = name => familyMap[name] || name;

const familyOrder = ['Slime', 'Dragon', 'Beast', 'Nature', 'Material', 'Demon', 'Undead', '???'];
const rankOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS'];

// Turn one recipe component into synthesis tokens, treating families like DQMTDP.
const parseComponent = raw => {
	const c = raw.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
	if (!c) return [];
	// "Rank S+ Beast Family" -> ["Beast Family", "Rank S+"]
	let m = c.match(/^Rank (\S+) (.+?) Family$/);
	if (m) return [`${mapFamily(m[2])} Family`, `Rank ${m[1]}`];
	// "Beast Family Rank A or lower" -> ["Beast Family", "Rank A or lower"]
	m = c.match(/^(.+?) Family (Rank .+)$/);
	if (m) return [`${mapFamily(m[1])} Family`, m[2]];
	// "Beast Family" -> "Demon Family"
	m = c.match(/^(.+?) Family$/);
	if (m) return [`${mapFamily(m[1])} Family`];
	return [c];
};

// Non-synthesis recipe phrases are anything without a combo (" x ") or a [Family] ref.
const parseRecipes = (recipe, selfFamily, selfRank) => {
	if (!recipe) return [];
	const synthesis = [];
	recipe.split('\n').forEach(line => {
		const t = line.trim();
		if (!t) return;
		if (t === 'Standard Breeding') {
			synthesis.push([`${selfFamily} Family`, `Rank ${selfRank}`]);
			return;
		}
		const norm = t.replace(/×/g, 'x'); // some 4-way recipes use the × sign
		if (!norm.includes(' x ') && !/\[.*Family.*\]/.test(norm)) return; // scout/egg/etc.
		norm.split(' OR ').forEach(alt => {
			const list = alt.split(' x ').flatMap(parseComponent).filter(Boolean);
			if (list.length) synthesis.push(list);
		});
	});
	return synthesis;
};

const families = {};
data.forEach(r => {
	const name = r[2];
	if (name === '#N/A' || r[6] === 'Unkown') return;
	const rank = r[4];
	const family = mapFamily(r[6]);
	if (!families[family]) families[family] = {};
	if (!families[family][rank]) families[family][rank] = [];
	families[family][rank].push({
		name,
		rank,
		family,
		synthesis: parseRecipes(r[16], family, rank),
	});
});

// canonical family/rank ordering
const ordered = {};
[
	...familyOrder.filter(f => families[f]),
	...Object.keys(families).filter(f => !familyOrder.includes(f)),
].forEach(family => {
	ordered[family] = {};
	const ranks = families[family];
	[
		...rankOrder.filter(r => ranks[r]),
		...Object.keys(ranks).filter(r => !rankOrder.includes(r)),
	].forEach(rank => {
		ordered[family][rank] = ranks[rank];
	});
});

writeJson(dst, ordered);
