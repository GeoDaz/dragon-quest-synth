import { useCallback, useMemo, useState } from 'react';
import { Monster, Monsters } from '@/types/Monster';

export interface TrailNode {
	name: string;
	rank?: string;
	plus?: string;
	parents?: TrailNode[];
}

export const isFamily = (token: string) => token.includes('Family');
const isRank = (token: string) => token.includes('Rank');
const isPlus = (token: string) => token.startsWith('Plus ');
const isCondition = (token: string) => isRank(token) || isPlus(token);

export const height = (node: TrailNode): number =>
	node.parents?.length ? 1 + Math.max(...node.parents.map(height)) : 0;

export const findNode = (node: TrailNode, name: string): TrailNode | undefined =>
	node.name == name ? node : node.parents?.map(p => findNode(p, name)).find(Boolean);

const recipeParents = (recipe: string[]): TrailNode[] => {
	const rank = recipe.find(isRank)?.split(' ').pop();
	const plus = recipe.find(isPlus)?.split(' ').pop();
	return recipe
		.filter(token => !isCondition(token))
		.map(token =>
			isFamily(token) ? { name: token, rank, plus } : { name: token, plus }
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
	const [preferred, setPreferred] = useState<string | undefined>();

	const regraft = (current: TrailNode[], holder: TrailNode, name: string, parents: TrailNode[]) => {
		const displaced: TrailNode[] = [];
		const grafted = graft(holder, name, parents, displaced);
		return join([
			...current.map(root => (root === holder ? grafted : root)),
			...displaced,
		]);
	};

	const walkFrom = useCallback((child: string, recipe: string[]) => {
		const parents = recipeParents(recipe);
		setRoots(current => {
			const holder = current.find(root => !!findNode(root, child));
			if (!holder) return join([...current, { name: child, parents }]);
			return regraft(current, holder, child, parents);
		});
	}, []);

	const walkInto = useCallback(
		(monster: string, into: string) => {
			const recipe = simplestRecipe(monsters[into], monster);
			const parents = recipe ? recipeParents(recipe) : [{ name: monster }];
			setRoots(current => {
				const holder = current.find(root => root.name == into);
				if (!holder) return join([...current, { name: into, parents }]);
				return regraft(current, holder, into, parents);
			});
		},
		[monsters]
	);

	const addDefault = useCallback(
		(name: string) => {
			const recipe = defaultRecipe(monsters[name]);
			setRoots(current => {
				const parents = recipe ? recipeParents(recipe) : undefined;
				const holder = current.find(root => !!findNode(root, name));
				if (!holder) return join([...current, { name, parents }]);
				if (!parents) return current;
				return regraft(current, holder, name, parents);
			});
		},
		[monsters]
	);

	const pickInTrail = useCallback(
		(name: string) => {
			const node = roots.map(root => findNode(root, name)).find(Boolean);
			if (node?.parents?.length) {
				setPreferred(name);
				return;
			}
			addDefault(name);
		},
		[roots, addDefault]
	);

	const clearTrail = useCallback(() => {
		setRoots([]);
		setPreferred(undefined);
	}, []);

	const walk = useMemo(
		() => ({ walkInto, walkFrom, addDefault }),
		[walkInto, walkFrom, addDefault]
	);

	return { trees: roots, preferred, walk, pickInTrail, clearTrail };
};

export default useSynthesisTrail;
