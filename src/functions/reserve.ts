import { Monster, Monsters } from '@/types/Monster';

export interface ReserveEntry {
	name: string;
	count: number;
}

export type ReserveStock = { [name: string]: number };

export interface SynthesisOption {
	result: Monster;
	recipe: string[];
	used: ReserveEntry[];
	rank?: string;
	plus?: string;
	gain: number;
	owned: boolean;
}

const isRankToken = (token: string) => token.includes('Rank');
const isPlusToken = (token: string) => token.startsWith('Plus ');
const isFamilyToken = (token: string) => token.includes('Family');
const isCondition = (token: string) => isRankToken(token) || isPlusToken(token);

export const familyOf = (token: string) => token.replace(' Family', '');

export const toStock = (entries: ReserveEntry[]): ReserveStock =>
	entries.reduce((stock, entry) => {
		stock[entry.name] = (stock[entry.name] || 0) + entry.count;
		return stock;
	}, {} as ReserveStock);

const countUsed = (names: string[]): ReserveEntry[] => {
	const counts: ReserveStock = {};
	names.forEach(name => {
		counts[name] = (counts[name] || 0) + 1;
	});
	return Object.entries(counts).map(([name, count]) => ({ name, count }));
};

export type StockIndex = { [family: string]: { [rank: string]: string[] } };

export const indexStock = (stock: ReserveStock, monsters: Monsters): StockIndex => {
	const index: StockIndex = {};
	Object.keys(stock).forEach(name => {
		const monster = monsters[name];
		if (!monster) return;
		const families = [monster.family, monster.to, ...(monster.subfamily || [])];
		new Set(families.filter(Boolean) as string[]).forEach(family => {
			const ranks = (index[family] = index[family] || {});
			(ranks[''] = ranks[''] || []).push(name);
			(ranks[monster.rank] = ranks[monster.rank] || []).push(name);
		});
	});
	return index;
};

const fillFamilies = (
	slots: string[][],
	left: ReserveStock,
	picked: string[]
): string[] | null => {
	if (!slots.length) return picked;
	const [candidates, ...rest] = slots;
	for (const name of candidates) {
		if (!left[name]) continue;
		left[name]--;
		const done = fillFamilies(rest, left, [...picked, name]);
		left[name]++;
		if (done) return done;
	}
	return null;
};

export const matchRecipe = (
	recipe: string[],
	stock: ReserveStock,
	monsters: Monsters,
	index: StockIndex = indexStock(stock, monsters),
	left: ReserveStock = { ...stock }
): string[] | null => {
	const rank = recipe.find(isRankToken)?.split(' ').pop() || '';
	const parents = recipe.filter(token => !isCondition(token));
	if (!parents.length) return null;

	const picked: string[] = [];
	const slots: string[][] = [];
	const release = () => picked.forEach(name => left[name]++);
	for (const token of parents) {
		if (isFamilyToken(token)) {
			const candidates = index[familyOf(token)]?.[rank];
			if (!candidates) {
				release();
				return null;
			}
			slots.push(candidates);
			continue;
		}
		if (!left[token]) {
			release();
			return null;
		}
		left[token]--;
		picked.push(token);
	}
	slots.sort((a, b) => a.length - b.length);

	const filled = fillFamilies(slots, left, picked);
	release();
	return filled;
};

const rankIndexer = (ranks: string[]) => {
	const order = ranks.reduce((acc, rank, i) => {
		acc[rank] = i;
		return acc;
	}, {} as { [rank: string]: number });
	return (rank?: string) => (rank && order[rank] !== undefined ? order[rank] : ranks.length);
};

export const possibleSyntheses = (
	monsters: Monsters,
	stock: ReserveStock,
	ranks: string[]
): SynthesisOption[] => {
	if (!Object.keys(stock).length) return [];
	const rankIndex = rankIndexer(ranks);
	const index = indexStock(stock, monsters);
	const left = { ...stock };
	const options: SynthesisOption[] = [];

	Object.values(monsters).forEach(result => {
		for (const recipe of result.synthesis || []) {
			const used = matchRecipe(recipe, stock, monsters, index, left);
			if (!used) continue;
			const best = Math.min(...used.map(name => rankIndex(monsters[name]?.rank)));
			options.push({
				result,
				recipe,
				used: countUsed(used),
				rank: recipe.find(isRankToken)?.split(' ').pop(),
				plus: recipe.find(isPlusToken)?.split(' ').pop(),
				gain: best - rankIndex(result.rank),
				owned: !!stock[result.name],
			});
			break;
		}
	});

	return options.sort(
		(a, b) =>
			b.gain - a.gain ||
			rankIndex(a.result.rank) - rankIndex(b.result.rank) ||
			a.result.name.localeCompare(b.result.name)
	);
};
