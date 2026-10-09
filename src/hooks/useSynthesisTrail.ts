import { useCallback, useMemo, useState } from 'react';
import { Monster, Monsters } from '@/types/Monster';

export interface TrailNode {
	name: string;
	rank?: string;
	plus?: string;
	lower?: boolean;
	parents?: TrailNode[];
}

export interface TrailPick {
	name: string;
	path: number[];
}

export const LOWER = 'Lower';
export const isLower = (token: string) => token == LOWER;
export const isFamily = (token: string) => token.includes('Family');
const isRank = (token: string) => token.includes('Rank');
const isPlus = (token: string) => token.startsWith('Plus ');
const isCondition = (token: string) => isRank(token) || isPlus(token);

export const height = (node: TrailNode): number =>
	node.parents?.length ? 1 + Math.max(...node.parents.map(height)) : 0;

export const findNode = (node: TrailNode, name: string): TrailNode | undefined =>
	node.name == name ? node : node.parents?.map(p => findNode(p, name)).find(Boolean);

export const nodeAt = (roots: TrailNode[], path: number[]): TrailNode | undefined =>
	path.slice(1).reduce<TrailNode | undefined>(
		(node, step) => node?.parents?.[step],
		roots[path[0]]
	);

const recipeParents = (recipe: string[]): TrailNode[] => {
	const rank = recipe.find(isRank)?.split(' ').pop();
	const plus = recipe.find(isPlus)?.split(' ').pop();
	return recipe
		.filter(token => !isCondition(token))
		.map(token =>
			isLower(token) ? { name: token, lower: true, plus }
			: isFamily(token) ? { name: token, rank, plus }
			: { name: token, plus }
		);
};

const recipeCost = (recipe: string[]) => {
	const parents = recipe.filter(token => !isCondition(token));
	if (parents.some(isFamily) || parents.length != recipe.length) return 1;
	return parents.length == 2 ? 0 : 2;
};

const bestRecipe = (recipes: string[][]) =>
	recipes.slice().sort((a, b) => recipeCost(a) - recipeCost(b))[0];

const defaultRecipe = (monster: Monster | undefined) => bestRecipe(monster?.synthesis || []);

const simplestRecipe = (result: Monster | undefined, parent: string) =>
	bestRecipe((result?.synthesis || []).filter(recipe => recipe.includes(parent)));

const hasLeaf = (node: TrailNode, name: string): boolean =>
	node.parents?.length ?
		node.parents.some(parent => hasLeaf(parent, name))
	:	node.name == name;

const fillLeaf = (node: TrailNode, subtree: TrailNode): TrailNode =>
	node.parents?.length ?
		{ ...node, parents: node.parents.map(parent => fillLeaf(parent, subtree)) }
	: node.name == subtree.name ? subtree
	: node;

const expandedNode = (roots: TrailNode[], name: string): TrailNode | undefined => {
	const find = (node: TrailNode): TrailNode | undefined =>
		!node.parents?.length ? undefined
		: node.name == name ? node
		: node.parents.map(find).find(Boolean);
	return roots.map(find).find(Boolean);
};

const prune = (node: TrailNode, steps: number[]): TrailNode => {
	if (!steps.length) {
		const { parents, ...rest } = node;
		return rest;
	}
	const [step, ...rest] = steps;
	return {
		...node,
		parents: node.parents?.map((parent, i) => (i == step ? prune(parent, rest) : parent)),
	};
};

const join = (roots: TrailNode[]): TrailNode[] => {
	for (let i = 0; i < roots.length; i++) {
		for (let j = 0; j < roots.length; j++) {
			if (i == j || !hasLeaf(roots[j], roots[i].name)) continue;
			return join(
				roots
					.map((root, k) => (k == j ? fillLeaf(root, roots[i]) : root))
					.filter((_, k) => k != i)
			);
		}
	}
	return roots;
};

const graft = (
	node: TrailNode,
	name: string,
	parents: TrailNode[],
	displaced: TrailNode[]
): TrailNode => {
	if (node.name == name) {
		const kept = node.parents || [];
		const used: TrailNode[] = [];
		const next = parents.map(parent => {
			const old = kept.find(
				current => current.name == parent.name && !used.includes(current)
			);
			if (old) used.push(old);
			return old || parent;
		});
		kept.filter(old => !used.includes(old)).forEach(old => displaced.push(old));
		return { ...node, parents: next };
	}
	if (!node.parents) return node;
	return {
		...node,
		parents: node.parents.map(parent => graft(parent, name, parents, displaced)),
	};
};

const useSynthesisTrail = (monsters: Monsters) => {
	const [roots, setRoots] = useState<TrailNode[]>([]);
	const [preferred, setPreferred] = useState<TrailPick | undefined>();

	const regraft = (current: TrailNode[], name: string, parents: TrailNode[]) => {
		const displaced: TrailNode[] = [];
		const grafted = current.map(root =>
			findNode(root, name) ? graft(root, name, parents, displaced) : root
		);
		return join([...grafted, ...displaced]);
	};

	const walkFrom = useCallback((child: string, recipe: string[]) => {
		const parents = recipeParents(recipe);
		setRoots(current => {
			if (!current.some(root => !!findNode(root, child)))
				return join([...current, { name: child, parents }]);
			return regraft(current, child, parents);
		});
	}, []);

	const walkInto = useCallback(
		(monster: string, into: string) => {
			const recipe = simplestRecipe(monsters[into], monster);
			const parents = recipe ? recipeParents(recipe) : [{ name: monster }];
			setRoots(current => {
				const holder = current.find(root => root.name == into);
				if (!holder) return join([...current, { name: into, parents }]);
				return regraft(current, into, parents);
			});
		},
		[monsters]
	);

	const addDefault = useCallback(
		(name: string) => {
			const recipe = defaultRecipe(monsters[name]);
			setRoots(current => {
				const parents = recipe ? recipeParents(recipe) : undefined;
				if (!current.some(root => !!findNode(root, name)))
					return join([...current, { name, parents }]);
				const known = expandedNode(current, name);
				if (known && current.some(root => hasLeaf(root, name)))
					return current.map(root => fillLeaf(root, known));
				if (!parents) return current;
				return regraft(current, name, parents);
			});
		},
		[monsters]
	);

	const pickInTrail = useCallback(
		(pick: TrailPick) => {
			setPreferred(pick);
			const known = expandedNode(roots, pick.name);
			if (!known) {
				addDefault(pick.name);
				return;
			}
			if (roots.some(root => hasLeaf(root, pick.name)))
				setRoots(current => current.map(root => fillLeaf(root, known)));
		},
		[roots, addDefault]
	);

	const cutTrail = useCallback((path: number[]) => {
		const [tree, ...steps] = path;
		setRoots(current =>
			current.map((root, i) => (i == tree ? prune(root, steps) : root))
		);
	}, []);

	const clearTrail = useCallback(() => {
		setRoots([]);
		setPreferred(undefined);
	}, []);

	const walk = useMemo(
		() => ({ walkInto, walkFrom, addDefault }),
		[walkInto, walkFrom, addDefault]
	);

	return { trees: roots, preferred, walk, pickInTrail, clearTrail, cutTrail };
};

export default useSynthesisTrail;
