import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReserveEntry, ReserveStock, toStock } from '@/functions/reserve';

const storageKey = (game: string) => `reserve-${game}`;

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

const useReserve = (game: string) => {
	const [entries, setEntries] = useState<ReserveEntry[]>([]);
	const [loaded, setLoaded] = useState<string>();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setEntries(read(game));
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

	const addToReserve = useCallback((name: string) => {
		setEntries(current =>
			current.some(entry => entry.name == name) ?
				current.map(entry =>
					entry.name == name ? { ...entry, count: entry.count + 1 } : entry
				)
			:	[...current, { name, count: 1 }]
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

	const stock = useMemo(() => toStock(entries), [entries]);

	const reserve = useMemo(
		() => ({ stock, addToReserve, removeFromReserve, openReserve }),
		[stock, addToReserve, removeFromReserve, openReserve]
	);

	return {
		entries,
		stock,
		reserve,
		open,
		toggleReserve,
		addToReserve,
		removeFromReserve,
		dropFromReserve,
		clearReserve,
	};
};

export default useReserve;
