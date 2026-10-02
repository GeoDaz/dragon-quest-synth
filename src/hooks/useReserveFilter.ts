import { useMemo, useState } from 'react';
import { Monster } from '@/types/Monster';
import { GoalRecipe, ReserveEntry, SynthesisOption } from '@/functions/reserve';
import { stringToKey } from '@/functions';
import useTranslate from '@/hooks/useTranslate';

export interface GoalItem {
	goal: Monster;
	recipes: GoalRecipe[];
}

const useReserveFilter = (
	entries: ReserveEntry[],
	options: SynthesisOption[],
	goalItems: GoalItem[]
) => {
	const [query, setQuery] = useState('');
	const { translateMonster } = useTranslate();
	const search = stringToKey(query);

	const matches = useMemo(() => {
		if (!search) return () => true;
		const cache: { [name: string]: boolean } = {};
		return (names: string[]) =>
			names.some(name => {
				if (cache[name] === undefined) {
					cache[name] =
						stringToKey(name).includes(search) ||
						stringToKey(translateMonster(name)).includes(search);
				}
				return cache[name];
			});
	}, [search, translateMonster]);

	const filteredEntries = useMemo(
		() => entries.filter(entry => matches([entry.name])),
		[entries, matches]
	);
	const filteredOptions = useMemo(
		() =>
			options.filter(option =>
				matches([
					option.result.name,
					...option.used.map(parent => parent.name),
					...option.alternatives.flat().map(parent => parent.name),
				])
			),
		[options, matches]
	);
	const filteredGoals = useMemo(
		() =>
			goalItems.filter(({ goal, recipes }) =>
				matches([
					goal.name,
					...recipes.flatMap(recipe => [
						...recipe.parts
							.filter(part => part.kind == 'monster')
							.map(part => part.token),
						...(recipe.combo || []).map(parent => parent.name),
					]),
				])
			),
		[goalItems, matches]
	);

	return { query, setQuery, search, filteredEntries, filteredOptions, filteredGoals };
};

export default useReserveFilter;
