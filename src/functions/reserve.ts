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
	alternatives: ReserveEntry[][];
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

export type RankIndex = (rank?: string) => number;

export const rankIndexer = (ranks: string[]): RankIndex => {
	const order = ranks.reduce(
		(acc, rank, i) => {
			acc[rank] = i;
			return acc;
		},
		{} as { [rank: string]: number }
	);
	return (rank?: string) =>
		rank && order[rank] !== undefined ? order[rank] : ranks.length;
};

const comboKey = (names: string[]) => [...names].sort().join('|');

export const matchRecipe = (
	recipe: string[],
	stock: ReserveStock,
	monsters: Monsters,
	rankIndex: RankIndex,
	index: StockIndex = indexStock(stock, monsters),
	left: ReserveStock = { ...stock }
): string[][] => {
	const rank = recipe.find(isRankToken)?.split(' ').pop() || '';
	const parents = recipe.filter(token => !isCondition(token));
	if (!parents.length) return [];

	const picked: string[] = [];
	const families: string[] = [];
	const release = () => picked.forEach(name => left[name]++);
	for (const token of parents) {
		if (isFamilyToken(token)) {
			families.push(familyOf(token));
			continue;
		}
		if (!left[token]) {
			release();
			return [];
		}
		left[token]--;
		picked.push(token);
	}

	const lowestFirst = (names: string[] = []) =>
		[...names].sort(
			(a, b) =>
				rankIndex(monsters[b]?.rank) - rankIndex(monsters[a]?.rank) ||
				a.localeCompare(b)
		);
	const ceiling = rank ? rankIndex(rank) : -1;
	const free = families.map(family =>
		lowestFirst(index[family]?.['']).filter(
			name => rankIndex(monsters[name]?.rank) >= ceiling
		)
	);

	const combos: string[][] = [];
	const seen = new Set<string>();
	const push = (combo: string[] | null) => {
		if (!combo) return;
		const key = comboKey(combo);
		if (seen.has(key)) return;
		seen.add(key);
		combos.push(combo);
	};

	if (!rank || !families.length) {
		push(fillFamilies(free, left, picked));
	} else {
		families.forEach((family, i) => {
			const anchors = lowestFirst(index[family]?.[rank]);
			if (!anchors.length) return;
			const slots = [anchors, ...free.filter((_, j) => j !== i)];
			push(fillFamilies(slots, left, picked));
		});
	}
	release();
	return combos;
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

	const cost = (names: string[]) =>
		names.reduce(
			(sum, name) => sum + ranks.length - rankIndex(monsters[name]?.rank),
			0
		);

	Object.values(monsters).forEach(result => {
		for (const recipe of result.synthesis || []) {
			const combos = matchRecipe(recipe, stock, monsters, rankIndex, index, left);
			if (!combos.length) continue;
			combos.sort((a, b) => cost(a) - cost(b));
			const [used, ...others] = combos;
			const best = Math.min(...used.map(name => rankIndex(monsters[name]?.rank)));
			options.push({
				result,
				recipe,
				used: countUsed(used),
				alternatives: others.map(countUsed),
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

export interface GoalPart {
	token: string;
	kind: 'monster' | 'family' | 'lower';
	owned: string[];
	ok: boolean;
}

export interface GoalRecipe {
	recipe: string[];
	parts: GoalPart[];
	rank?: string;
	rankOk: boolean;
	plus?: string;
	combo: ReserveEntry[] | null;
}

export const goalRecipes = (
	goal: Monster,
	monsters: Monsters,
	stock: ReserveStock,
	ranks: string[]
): GoalRecipe[] => {
	const rankIndex = rankIndexer(ranks);
	const index = indexStock(stock, monsters);
	const total = Object.values(stock).reduce((sum, count) => sum + count, 0);
	const lowestFirst = (names: string[] = []) =>
		[...names].sort(
			(a, b) =>
				rankIndex(monsters[b]?.rank) - rankIndex(monsters[a]?.rank) ||
				a.localeCompare(b)
		);

	return (goal.synthesis || [])
		.map(recipe => {
			const rank = recipe.find(isRankToken)?.split(' ').pop();
			const plus = recipe.find(isPlusToken)?.split(' ').pop();
			const ceiling = rank ? rankIndex(rank) : -1;
			const parents = recipe.filter(token => !isCondition(token));
			const needed: ReserveStock = {};
			parents.forEach(token => {
				needed[token] = (needed[token] || 0) + 1;
			});
			const parts: GoalPart[] = parents.map(token => {
				if (token == 'Lower') {
					return {
						token,
						kind: 'lower',
						owned: [],
						ok: total > parents.length - 1,
					};
				}
				if (isFamilyToken(token)) {
					const owned = lowestFirst(index[familyOf(token)]?.['']).filter(
						name => rankIndex(monsters[name]?.rank) >= ceiling
					);
					return { token, kind: 'family', owned, ok: !!owned.length };
				}
				const active = stock[token] || 0;
				return {
					token,
					kind: 'monster',
					owned: active ? [token] : [],
					ok: active >= needed[token],
				};
			});
			const families = parents.filter(isFamilyToken).map(familyOf);
			const rankOk =
				!rank ||
				!families.length ||
				families.some(family => !!index[family]?.[rank]?.length);
			const lowers = parents.filter(token => token == 'Lower').length;
			const strict = recipe.filter(token => token != 'Lower');
			const combos = matchRecipe(strict, stock, monsters, rankIndex, index);
			const cost = (names: string[]) =>
				names.reduce(
					(sum, name) => sum + ranks.length - rankIndex(monsters[name]?.rank),
					0
				);
			combos.sort((a, b) => cost(a) - cost(b));
			const best = combos.find(combo => total - combo.length >= lowers);
			return {
				recipe,
				parts,
				rank,
				rankOk,
				plus,
				combo: best ? countUsed(best) : null,
			};
		})
		.sort((a, b) => Number(!!b.combo) - Number(!!a.combo));
};
