import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReserveEntry, ReserveStock, toStock } from '@/functions/reserve';

const storageKey = (game: string) => `reserve-${game}`;

const goalsKey = (game: string) => `reserve-goals-${game}`;

const EXPANDED_KEY = 'reserve-expanded';

const read = (game: string): ReserveEntry[] => {
	try {
		const stored = localStorage.getItem(storageKey(game));
		if (!stored) return [];
		const parsed = JSON.parse(stored);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(entry => entry?.name && entry.count > 0)
			.map(entry => ({ name: entry.name, count: entry.count }));
	} catch (error) {
		console.error(error);
		return [];
	}
};

const readGoals = (game: string): string[] => {
	try {
		const stored = localStorage.getItem(goalsKey(game));
		if (!stored) return [];
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed.filter(name => typeof name == 'string') : [];
	} catch (error) {
		console.error(error);
		return [];
	}
};

const useReserve = (game: string) => {
	const [entries, setEntries] = useState<ReserveEntry[]>([]);
	const [goals, setGoals] = useState<string[]>([]);
	const [loaded, setLoaded] = useState<string>();
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		try {
			setExpanded(localStorage.getItem(EXPANDED_KEY) == 'true');
		} catch (error) {
			console.error(error);
		}
	}, []);

	useEffect(() => {
		setEntries(read(game));
		setGoals(readGoals(game));
		setLoaded(game);
	}, [game]);

	useEffect(() => {
		if (loaded != game) return;
		try {
			localStorage.setItem(storageKey(game), JSON.stringify(entries));
		} catch (error) {
			console.error(error);
		}
	}, [entries, game, loaded]);

	useEffect(() => {
		if (loaded != game) return;
		try {
			localStorage.setItem(goalsKey(game), JSON.stringify(goals));
		} catch (error) {
			console.error(error);
		}
	}, [goals, game, loaded]);

	const toggleGoal = useCallback((name: string) => {
		setGoals(current =>
			current.includes(name) ?
				current.filter(goal => goal != name)
			:	[...current, name]
		);
	}, []);

	const clearGoals = useCallback(() => setGoals([]), []);

	const addToReserve = useCallback((name: string) => {
		setEntries(current =>
			current.some(entry => entry.name == name) ?
				current.map(entry =>
					entry.name == name ? { ...entry, count: entry.count + 1 } : entry
				)
			:	[...current, { name, count: 1 }]
		);
		setGoals(current =>
			current.includes(name) ? current.filter(goal => goal != name) : current
		);
	}, []);

	const removeFromReserve = useCallback((name: string) => {
		setEntries(current =>
			current
				.map(entry =>
					entry.name == name ? { ...entry, count: entry.count - 1 } : entry
				)
				.filter(entry => entry.count > 0)
		);
	}, []);

	const dropFromReserve = useCallback((name: string) => {
		setEntries(current => current.filter(entry => entry.name != name));
	}, []);

	const clearReserve = useCallback(() => setEntries([]), []);

	const openReserve = useCallback(() => setOpen(true), []);

	const toggleReserve = useCallback(() => setOpen(current => !current), []);

	const toggleExpanded = useCallback(
		() =>
			setExpanded(current => {
				try {
					localStorage.setItem(EXPANDED_KEY, String(!current));
				} catch (error) {
					console.error(error);
				}
				return !current;
			}),
		[]
	);

	const stock = useMemo(() => toStock(entries), [entries]);

	const reserve = useMemo(
		() => ({ stock, goals, addToReserve, removeFromReserve, openReserve, toggleGoal }),
		[stock, goals, addToReserve, removeFromReserve, openReserve, toggleGoal]
	);

	return {
		entries,
		stock,
		goals,
		toggleGoal,
		clearGoals,
		reserve,
		open,
		toggleReserve,
		expanded,
		toggleExpanded,
		addToReserve,
		removeFromReserve,
		dropFromReserve,
		clearReserve,
	};
};

export default useReserve;
