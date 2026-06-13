const fs = require('fs');

const parse = file => {
	const lines = fs.readFileSync(file, 'utf8').split('\n');
	const pairs = [];
	const nameRe = /^([+-])\s*"name":\s*"(.+?)",?\s*$/;
	for (let i = 0; i < lines.length - 1; i++) {
		const a = lines[i].match(nameRe);
		const b = lines[i + 1].match(nameRe);
		// in-place rename: removed name immediately followed by added name
		if (a && b && a[1] === '-' && b[1] === '+' && a[2] !== b[2]) {
			pairs.push([a[2], b[2]]);
		}
	}
	return pairs;
};

const all = [...parse('./src/json/ignored/DQMJ2-history.diff'), ...parse('./src/json/ignored/DQMJ3Pro-history.diff')];

// collapse chains (old->mid, mid->new) and dedupe; keep last (newest) target per old
const map = {};
for (const [o, n] of all) map[o] = n;
// resolve chains
const resolve = k => { const seen = new Set(); let v = k; while (map[v] && !seen.has(v)) { seen.add(v); v = map[v]; } return v; };
const final = {};
for (const o of Object.keys(map)) { const r = resolve(o); if (r !== o) final[o] = r; }

console.log('raw in-place rename pairs:', all.length);
console.log('distinct old->new (chain-resolved):', Object.keys(final).length);
for (const [o, n] of Object.entries(final).sort()) console.log(`  "${o}" -> "${n}"`);
fs.writeFileSync('./src/json/ignored/manual-renames.json', JSON.stringify(final, null, 2));
