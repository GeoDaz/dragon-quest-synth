const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

sharp.cache(false);

const ROOT = path.join(__dirname, '..', 'public', 'images');
const COLOURS = 256;
const JPEG_QUALITY = 80;
const MIN_BYTES = 8 * 1024;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const flag = name => {
	const found = args.find(a => a.startsWith(`--${name}=`));
	return found ? Number(found.slice(name.length + 3)) : undefined;
};
const colours = flag('colours') || COLOURS;
const targets = args.filter(a => !a.startsWith('--'));

function walk(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else out.push(full);
	}
	return out;
}

const fmtKB = bytes => (bytes / 1024).toFixed(0) + ' Ko';
const fmtMB = bytes => (bytes / 1024 / 1024).toFixed(1) + ' Mo';

async function encode(input, file) {
	if (/\.png$/i.test(file)) {
		return sharp(input)
			.png({ palette: true, colours, effort: 10, compressionLevel: 9 })
			.toBuffer();
	}
	const meta = await sharp(input).metadata();
	let pipeline = sharp(input).rotate();
	if (meta.hasAlpha) {
		pipeline = pipeline.flatten({ background: '#ffffff' });
	}
	return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

(async () => {
	const files = (
		targets.length
			? targets
					.map(a => path.resolve(a))
					.filter(f => fs.existsSync(f) && fs.statSync(f).isFile())
			: walk(ROOT)
	).filter(f => /\.(png|jpe?g)$/i.test(f));

	if (!files.length) {
		console.log('Aucune image à traiter.');
		return;
	}

	let before = 0;
	let after = 0;
	let changed = 0;
	let skipped = 0;
	let errored = 0;
	const top = [];

	for (const file of files) {
		const input = fs.readFileSync(file);
		const orig = input.length;
		before += orig;

		if (orig < MIN_BYTES) {
			after += orig;
			skipped++;
			continue;
		}

		let buf;
		try {
			buf = await encode(input, file);
		} catch (e) {
			after += orig;
			errored++;
			console.error(`${path.relative(ROOT, file)} : ${e.message}`);
			continue;
		}

		if (buf.length >= orig) {
			after += orig;
			skipped++;
			continue;
		}

		if (!dryRun) fs.writeFileSync(file, buf);
		after += buf.length;
		changed++;
		top.push({ f: path.relative(ROOT, file), from: orig, to: buf.length });
	}

	top.sort((a, b) => b.from - b.to - (a.from - a.to));
	console.log('\n=== Top 15 réductions ===');
	for (const t of top.slice(0, 15)) {
		const pct = ((1 - t.to / t.from) * 100).toFixed(0);
		console.log(`${t.f}\n   ${fmtKB(t.from)} -> ${fmtKB(t.to)}  (-${pct}%)`);
	}

	console.log(`\n=== Bilan${dryRun ? ' (--dry-run, rien écrit)' : ''} ===`);
	console.log(`Palette : ${colours} couleurs`);
	console.log(`Réécrits : ${changed}`);
	console.log(`Ignorés (trop petits / non réduits) : ${skipped}`);
	console.log(`Erreurs : ${errored}`);
	console.log(`Poids total : ${fmtMB(before)} -> ${fmtMB(after)}`);
	const pct = ((1 - after / before) * 100).toFixed(0);
	console.log(`Économie : ${fmtMB(before - after)} (-${pct}%)`);
})();
