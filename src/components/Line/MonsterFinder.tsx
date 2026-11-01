import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Icon from '@/components/Icon';
import LineImage from './LineImage';
import { SearchContext } from '@/context/search';
import { MonsterInfoContext } from '@/context/monsterInfo';
import { makeClassName, stringToKey } from '@/functions';
import { getSearchPriority } from '@/functions/search';
import useTranslate from '@/hooks/useTranslate';
import { StringObject } from '@/types/Ui';

const translatedMonsters: StringObject = require('../../json/monsterTranslations.json');

const PAGE_SIZE = 100;
const VARIANT = / \((?:Alt(?: \d+)?|\d+)\)$/;

const baseName = (name: string) => name.replace(VARIANT, '');

const variantOrder = (name: string): number => {
	const variant = name.match(VARIANT)?.[0];
	if (!variant) return 0;
	return Number(variant.match(/\d+/)?.[0] || 1);
};

interface Result {
	name: string;
	base: string;
	priority: number;
	prefix: boolean;
}

interface Props {
	onSelect: (name: string) => void;
	id?: string;
	label?: string;
	forwardRef?: React.Ref<HTMLInputElement>;
	disabled?: boolean;
}

const MonsterFinder: React.FC<Props> = ({
	onSelect,
	id = 'monster-finder-search',
	label = 'Research a Monster',
	forwardRef,
	disabled,
}) => {
	const searchList = useContext(SearchContext);
	const { translateUI } = useTranslate();
	const [query, setQuery] = useState('');
	const [selection, setSelection] = useState(0);
	const [limit, setLimit] = useState(PAGE_SIZE);
	const listRef = useRef<HTMLDivElement>(null);
	const trimmedQuery = query.trim();

	const results = useMemo<Result[]>(() => {
		if (!searchList || !trimmedQuery) return [];
		const queryKey = stringToKey(trimmedQuery);
		const seen = new Map<string, Result>();
		searchList.keys.forEach(key => {
			const priority = getSearchPriority(trimmedQuery, key);
			if (priority == null) return;
			const prefix = stringToKey(key).startsWith(queryKey);
			const name = searchList.mapped[key] || key;
			const previous = seen.get(name);
			if (previous) {
				if (priority > previous.priority) previous.priority = priority;
				if (prefix) previous.prefix = true;
				return;
			}
			seen.set(name, { name, base: baseName(name), priority, prefix });
		});
		const groups = new Map<string, Result[]>();
		seen.forEach(result => {
			const group = groups.get(result.base);
			if (group) group.push(result);
			else groups.set(result.base, [result]);
		});
		searchList.values.forEach(name => {
			const base = baseName(name);
			const group = groups.get(base);
			if (group && !group.some(result => result.name === name)) {
				group.push({ ...group[0], name, base });
			}
		});
		const best = (group: Result[]) => ({
			prefix: group.some(result => result.prefix),
			priority: Math.max(...group.map(result => result.priority)),
		});
		return Array.from(groups.values())
			.sort((a, b) => {
				const x = best(a);
				const y = best(b);
				return (
					Number(y.prefix) - Number(x.prefix) ||
					y.priority - x.priority ||
					a[0].base.localeCompare(b[0].base)
				);
			})
			.flatMap(group =>
				group.sort((a, b) => variantOrder(a.name) - variantOrder(b.name))
			);
	}, [searchList, trimmedQuery]);

	useEffect(() => {
		setSelection(0);
		setLimit(PAGE_SIZE);
		listRef.current?.scrollTo({ top: 0 });
	}, [results]);

	useEffect(() => {
		listRef.current
			?.querySelector('.monster-finder-item.selected')
			?.scrollIntoView({ block: 'nearest' });
	}, [selection]);

	const handleSelect = (name: string) => {
		onSelect(name);
		setQuery('');
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		e.preventDefault();
		e.stopPropagation();
		const visible = Math.min(results.length, limit);
		if (e.key === 'Enter') {
			if (results[selection]) {
				handleSelect(results[selection].name);
			} else if (trimmedQuery) {
				handleSelect(trimmedQuery);
			}
		} else if (visible > 0) {
			setSelection(
				e.key === 'ArrowDown' ?
					(selection + 1) % visible
				:	(selection - 1 + visible) % visible
			);
		}
	};

	return (
		<div className="monster-finder mb-3">
			<div className="position-relative">
				<Form.Label htmlFor={id} visuallyHidden>
					{translateUI(label)}
				</Form.Label>
				<Form.Control
					ref={forwardRef}
					type="text"
					id={id}
					placeholder={translateUI(label)}
					value={query}
					onChange={e => setQuery(e.target.value)}
					onKeyDown={onKeyDown}
					autoComplete="off"
					className="research pe-5"
					disabled={disabled}
				/>
				<Icon
					name="search"
					className="position-absolute top-50 end-0 translate-middle-y me-3"
				/>
			</div>
			{!!trimmedQuery && (
				<>
					<div className="text-muted small mt-2 mb-1">
						{results.length} result{results.length > 1 ? 's' : ''}
					</div>
					{results.length > 0 && (
						<div
							ref={listRef}
							className="monster-finder-list list-group"
							role="listbox"
						>
							{results.slice(0, limit).map((result, i) => (
								<MonsterFinderItem
									key={result.name}
									name={result.name}
									selected={i === selection}
									onClick={() => handleSelect(result.name)}
								/>
							))}
							{results.length > limit && (
								<Button
									variant="link"
									className="list-group-item"
									onClick={() => setLimit(limit + PAGE_SIZE)}
								>
									Show more ({results.length - limit} left)
								</Button>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
};

const MonsterFinderItem: React.FC<{
	name: string;
	selected: boolean;
	onClick: () => void;
}> = ({ name, selected, onClick }) => {
	const infos = useContext(MonsterInfoContext);
	const { translateUI } = useTranslate();
	const base = baseName(name);
	const variant = name.slice(base.length).trim();
	const dubName = translatedMonsters[base];
	const info = infos[base];
	const details = info ? [translateUI(info[0]), info[1]] : [];
	return (
		<button
			type="button"
			role="option"
			aria-selected={selected}
			className={makeClassName(
				'monster-finder-item list-group-item list-group-item-action d-flex align-items-center gap-3',
				selected && 'selected active'
			)}
			onClick={onClick}
		>
			<span className="monster-finder-thumb">
				<LineImage name={name} loadable={false} />
			</span>
			<span className="d-flex flex-column text-start">
				<span className="fw-bold">
					{base}
					{dubName && dubName !== base && (
						<span className="fw-normal"> / {dubName}</span>
					)}
					{!!variant && <span className="monster-finder-variant">{variant}</span>}
				</span>
				{details.length > 0 && (
					<small className="monster-finder-details">{details.join(' · ')}</small>
				)}
			</span>
		</button>
	);
};

export default MonsterFinder;
