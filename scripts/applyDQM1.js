const fs = require('fs');
const images = require('../src/json/monstersImages.json');
const gamePath = './src/json/DQM1.json';
const game = require('../src/json/DQM1.json');
const manual = JSON.parse(fs.readFileSync('./src/json/ignored/manual-renames.json', 'utf8'));

// DQM1-specific supplements: verified for DQM2 last session (Japanese+Fandom) and
// obvious DQM1 typos/romanisations of known monsters. Validated against keys below.
const supp = {
	// reused from verified DQM2 research
	'Tree Slime': 'Buddy Slime', 'King Mottle Slime': 'Mottle King Slime',
	'Liquid Metal King Slime': 'Liquid Metal Slime King', 'Dark Mecha-Slime': 'Dark Robot Slime',
	'Swordgon': 'Stabosaur', 'Rayburn': 'Wyvern', 'Smile Lizard': 'Raptile', 'Coatol': 'Flapdragon',
	'Xiphos': 'Xiphos The Deathbringer', 'Tigertaur': 'Trigertaur', 'Taurus': 'Taurix',
	'Veera': 'Hellsguard Veera', 'Florajay': 'Kingfuchsia', 'Digster': 'Palooka Prawn',
	'Lucky Bag': "Bag O' Tricks", 'Lexicon': "Archfiend's Grimoire", 'Stormgate Citadel': 'Stormsgate Citadel',
	'Saggitar': 'Sagittar', 'Tyrannasaura Wrecks': 'Tyrannosaura Wrecks', "Will-O'-Whips": "Will-O'-The-Whips",
	'Dead Masker': 'DeathMasker', 'Baramos Zombie': 'Bones Of Baramos', 'King Godwyn II': 'King Godwyn Second Forme',
	'Syphon': 'Siphon', "Robbin' Hood": "Robbin' 'Ood", 'Estarkers': 'Starkers', 'Elder Pippit': 'Elder Pipit',
	'Mortamor II': 'Mortamor Intermediate Forme', 'Nimzo II': 'Nimzo', 'Maizar': 'Malzar',
	'Rottney': 'Scruffy', 'Cottney': 'Fluffy', 'Baboon Beast': 'Hihyurude', 'Evil Beast': 'Hihyudorado',
	'Maizarcane': 'Malzar Beast', 'Maizarugius': 'Zumergias',
	// DQ7 summoned-spirit romanisations
	'Kakaron': 'Klashmi', 'Kasharami': 'Kamashki', 'Barubaru': 'Blamara', 'Domedi': 'Damniuni',
	// obvious DQM1 typos / spacing of known monsters
	'Mechanowyrn': "Mechan-O'-Wyrm", 'Goresdy-Purrvis': 'Lieutenant Goresby-Purrvis',
	'Goreham-Hogg': 'Lieutenant Goreham-Hogg', 'Marquis de Leon': 'Marquis De Léon',
	'Ogrodemir': 'Orgodemir', 'Thronella': 'Thornella', 'Roseguardian': 'Roseguardin',
	'Goreilla': 'Gorerilla', 'Scissor Beetle': 'Scissor Beatle', 'King Godwin': 'King Godwyn',
	'WhipBird': 'Gangleclaw', 'FireWeed': 'Flame Flower', 'BeanMan': 'Beanie Meanie',
	'MechaDragon': 'DrakMachine', 'Dameselfly': 'Damselfly', 'Swarm Troopers': 'Swarmtroop',
	'Hootingham-Gore': 'Lieutenant Hootingham-Gore',
};

const DRY = process.argv.includes('--dry');
const imgSet = new Set(Object.keys(images));
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const normIndex = {};
for (const k of Object.keys(images)) normIndex[norm(k)] = k;

// resolve a proposed name to a real image key (fix casing), or null
const toKey = n => (n && imgSet.has(n) ? n : normIndex[norm(n)] || null);

// existing name -> set of "family/rank" (to detect collisions)
const locsByName = {};
for (const f in game) for (const r in game[f]) for (const m of game[f][r]) {
	(locsByName[m.name] = locsByName[m.name] || new Set()).add(f + '/' + r);
}

// Build rename map for monsters whose name is not an image key.
const finalMap = {};
const dropped = [];
for (const f in game) for (const r in game[f]) for (const m of game[f][r]) {
	if (imgSet.has(m.name)) continue;
	// priority: DQM1 supplement > user's manual research > normalized casing match
	let cand = supp[m.name] ? toKey(supp[m.name]) : null;
	let via = cand ? 'supp' : '';
	if (!cand && manual[m.name]) { cand = toKey(manual[m.name]); via = 'manual'; }
	if (!cand) { cand = toKey(m.name); via = 'normalized'; }
	if (!cand) { dropped.push([m.name, '(no match)']); continue; }
	if (cand === m.name) continue;
	// collision guard: target already used by another monster in the SAME family/rank
	const here = f + '/' + r;
	if (locsByName[cand] && locsByName[cand].has(here)) { dropped.push([m.name, cand + ' [collision same family/rank]']); continue; }
	finalMap[m.name] = cand;
	finalMap[m.name + '\0via'] = via;
}

// apply
let renamed = 0, refs = 0;
for (const f in game) for (const r in game[f]) for (const m of game[f][r]) {
	if (finalMap[m.name]) { m.name = finalMap[m.name]; renamed++; }
	for (const syn of m.synthesis) for (let i = 0; i < syn.length; i++) {
		if (/Family|Rank/.test(syn[i])) continue;
		if (finalMap[syn[i]]) { syn[i] = finalMap[syn[i]]; refs++; }
	}
}

// stats
const viaCounts = {};
Object.keys(finalMap).filter(k => !k.includes('\0')).forEach(k => {
	const v = finalMap[k + '\0via']; viaCounts[v] = (viaCounts[v] || 0) + 1;
});
const stillMissing = [];
for (const f in game) for (const r in game[f]) for (const m of game[f][r]) if (!imgSet.has(m.name)) stillMissing.push(m.name);

console.log('renamed:', Object.keys(finalMap).filter(k => !k.includes('\0')).length, 'by source:', JSON.stringify(viaCounts), 'synthesis refs:', refs);
console.log('\n=== sample renames ===');
Object.keys(finalMap).filter(k => !k.includes('\0')).slice(0, 40).forEach(k => console.log(`  "${k}" -> "${finalMap[k]}" (${finalMap[k + '\0via']})`));
console.log('\n=== dropped/no-match (' + dropped.length + ') ===');
dropped.forEach(([n, why]) => console.log(`  "${n}"  [${why}]`));
console.log('\n=== STILL MISSING (' + stillMissing.length + ') ===');
console.log([...new Set(stillMissing)].join('\n'));

if (!DRY) { fs.writeFileSync(gamePath, JSON.stringify(game, null, 4)); console.log('\nWROTE ' + gamePath); }
else console.log('\n(dry run)');
