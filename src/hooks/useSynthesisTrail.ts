import { useCallback, useMemo, useState } from 'react';
import { Monster, Monsters } from '@/types/Monster';

// The trail is the synthesis tree being explored: the root is the monster
// obtained, the nodes above it are the recipe it comes from, and so on.
// Clicking a parent of a monster already in the tree grafts that recipe onto it
// rather than starting over, and clicking a parent of one of its other recipes
// replaces its branch. Walking forward wraps the whole tree into a new root.
// Height is capped because a branch costs twice the width of the one below.
const MAX_HEIGHT = 6;

export interface TrailNode {
	name: string;
	/** Required rank, carried only by the family placeholders of a recipe. */
	rank?: string;
	/** The grafted recipe. A node without parents is a leaf of the tree. */
	parents?: TrailNode[];
}

export const isFamily = (token: string) => token.includes('Family');
const isRank = (token: string) => token.includes('Rank');

export const height = (node: TrailNode): number =>
	node.parents?.length ? 1 + Math.max(...node.parents.map(height)) : 0;

const recipeParents = (recipe: string[]): TrailNode[] => {
	const rank = recipe.find(isRank)?.split(' ').pop();
	return recipe
		.filter(token => !isRank(token))
		.map(token => (isFamily(token) ? { name: token, rank } : { name: token }));
};

// Fewest family placeholders first — a recipe naming real monsters draws a
// proper tree — then the fewest parents, then the order of the data.
const simplestRecipe = (result: Monster | undefined, parent: string) => {
	const cost = (recipe: string[]) =>
		recipe.filter(isFamily).length * 10 + recipe.filter(token => !isRank(token)).length;
	return (result?.synthesis || [])
		.filter(recipe => recipe.includes(parent))
		.sort((a, b) => cost(a) - cost(b))[0];
};

const findNode = (node: TrailNode, name: string): TrailNode | undefined =>
	node.name == name ? node : node.parents?.map(p => findNode(p, name)).find(Boolean);

const contains = (node: TrailNode, name: string): boolean =>
	node.name == name || !!node.parents?.some(parent => contains(parent, name));

// Attach `parents` to the node named `name`, keeping whatever branch already
// grew under a parent the new recipe names again.
const graft = (node: TrailNode, name: string, parents: TrailNode[]): TrailNode => {
	if (node.name == name) {
		const kept = node.parents || [];
		return {
			...node,
			parents: parents.map(
				parent => kept.find(old => old.name == parent.name) || parent
			),
		};
	}
	if (!node.parents) return node;
	return { ...node, parents: node.parents.map(p => graft(p, name, parents)) };
};

const prune = (node: TrailNode, left: number): TrailNode =>
	left <= 0 || !node.parents ?
		{ name: node.name, rank: node.rank }
	:	{ ...node, parents: node.parents.map(parent => prune(parent, left - 1)) };

const useSynthesisTrail = (monsters: Monsters) => {
	const [tree, setTree] = useState<TrailNode | undefined>();

	const walkInto = useCallback(
		(monster: string, into: string) => {
			const recipe = simplestRecipe(monsters[into], monster);
			const parents = recipe ? recipeParents(recipe) : [{ name: monster }];
			setTree(current => {
				// already the result on display: only settle which recipe it uses
				if (current?.name == into) {
					return prune(graft(current, into, parents), MAX_HEIGHT);
				}
				// the tree so far becomes the branch feeding the new result
				const grown = current?.name == monster ? current : { name: monster };
				return prune(
					{
						name: into,
						parents: parents.map(p => (p.name == monster ? grown : p)),
					},
					MAX_HEIGHT
				);
			});
		},
		[monsters]
	);

	const walkFrom = useCallback((child: string, recipe: string[]) => {
		const parents = recipeParents(recipe);
		setTree(current =>
			prune(
				current && contains(current, child) ?
					graft(current, child, parents)
				:	{ name: child, parents },
				MAX_HEIGHT
			)
		);
	}, []);

	// Picking a monster of the trail switches the whole display to the tree grown
	// under it. A leaf has no tree of its own, so it only scrolls.
	const focusOn = useCallback((name: string) => {
		setTree(current => {
			const found = current && findNode(current, name);
			return found?.parents?.length ? found : current;
		});
	}, []);

	const clearTrail = useCallback(() => setTree(undefined), []);

	const walk = useMemo(() => ({ walkInto, walkFrom }), [walkInto, walkFrom]);

	return { tree, walk, focusOn, clearTrail };
};

export default useSynthesisTrail;
