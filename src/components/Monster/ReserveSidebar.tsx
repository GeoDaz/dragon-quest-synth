import { useContext, useEffect, useMemo, useState } from 'react';
import { Monsters } from '@/types/Monster';
import {
	ReserveEntry,
	ReserveStock,
	SynthesisOption,
	possibleSyntheses,
} from '@/functions/reserve';
import { makeClassName } from '@/functions';
import useTranslate from '@/hooks/useTranslate';
import { TrailContext } from '@/context/trail';
import AnchorLink from '../AnchorLink';
import Icon from '../Icon';
import MonsterImg from './MonsterImg';
import Rank from './Rank';

const PAGE_SIZE = 30;

interface Props {
	entries: ReserveEntry[];
	stock: ReserveStock;
	monsters: Monsters;
	ranks: string[];
	open: boolean;
	onToggle: () => void;
	onAdd: (name: string) => void;
	onRemove: (name: string) => void;
	onDrop: (name: string) => void;
	onClear: () => void;
}

const ReserveSidebar: React.FC<Props> = ({
	entries,
	stock,
	monsters,
	ranks,
	open,
	onToggle,
	onAdd,
	onRemove,
	onDrop,
	onClear,
}) => {
	const [shown, setShown] = useState(PAGE_SIZE);
	const { translateUI } = useTranslate();
	const options = useMemo(
		() => (open ? possibleSyntheses(monsters, stock, ranks) : []),
		[open, monsters, stock, ranks]
	);
	const total = entries.reduce((sum, entry) => sum + entry.count, 0);

	useEffect(() => {
		setShown(PAGE_SIZE);
	}, [stock]);

	return (
		<aside className={makeClassName('reserve-sidebar', open && 'open')}>
			<button
				type="button"
				className="reserve-handle"
				onClick={onToggle}
				aria-expanded={open}
				title={translateUI(open ? 'Close the reserve' : 'Open the reserve')}
			>
				<Icon name={open ? 'chevron-right' : 'chevron-left'} />
				<Icon name="box-seam" className="reserve-handle-icon" />
				{!!total && <span className="reserve-badge">{total}</span>}
			</button>
			{open && (
				<div className="reserve-panel">
					<header className="reserve-head">
						<h2 className="reserve-title">
							<Icon name="box-seam" /> {translateUI('Reserve')}
							{!!total && <span className="reserve-count">{total}</span>}
						</h2>
						{!!total && (
							<button
								type="button"
								className="reserve-icon-button"
								onClick={onClear}
								title={translateUI('Empty the reserve')}
							>
								<Icon name="trash" />
							</button>
						)}
					</header>
					<div className="reserve-body">
						{entries.length ?
							<ul className="reserve-list">
								{entries.map(entry => (
									<ReserveRow
										key={entry.name}
										entry={entry}
										rank={monsters[entry.name]?.rank}
										onAdd={onAdd}
										onRemove={onRemove}
										onDrop={onDrop}
									/>
								))}
							</ul>
						:	<p className="reserve-empty">
								{translateUI('Your reserve is empty.')}{' '}
								{translateUI(
									'Add monsters from the list to see what you can synthesize.'
								)}
							</p>
						}
						{!!entries.length && (
							<section className="reserve-section">
								<h3 className="reserve-subtitle">
									{translateUI('Possible syntheses')}
									<span className="reserve-count">{options.length}</span>
								</h3>
								{options.length ?
									<>
										<ul className="reserve-options">
											{options.slice(0, shown).map(option => (
												<OptionRow
													key={option.result.name}
													option={option}
													onAdd={onAdd}
												/>
											))}
										</ul>
										{shown < options.length && (
											<button
												type="button"
												className="reserve-more"
												onClick={() => setShown(shown + PAGE_SIZE)}
											>
												{translateUI('Show more')}
											</button>
										)}
									</>
								:	<p className="reserve-empty">
										{translateUI(
											'No synthesis available with this reserve.'
										)}
									</p>
								}
							</section>
						)}
					</div>
				</div>
			)}
		</aside>
	);
};

const ReserveRow = ({
	entry,
	rank,
	onAdd,
	onRemove,
	onDrop,
}: {
	entry: ReserveEntry;
	rank?: string;
	onAdd: (name: string) => void;
	onRemove: (name: string) => void;
	onDrop: (name: string) => void;
}) => {
	const { translateMonster, translateUI } = useTranslate();
	const label = translateMonster(entry.name);
	return (
		<li className="reserve-row">
			<AnchorLink hash={entry.name} className="reserve-link" title={label}>
				<MonsterImg name={entry.name} small title={label} />
				<span className="reserve-name">{label}</span>
			</AnchorLink>
			<Rank name={rank} className="reserve-rank" />
			<span className="reserve-stepper">
				<button
					type="button"
					className="reserve-icon-button"
					onClick={() => onRemove(entry.name)}
					title={translateUI('Remove from the reserve')}
				>
					<Icon name="dash-lg" />
				</button>
				<span className="reserve-quantity">{entry.count}</span>
				<button
					type="button"
					className="reserve-icon-button"
					onClick={() => onAdd(entry.name)}
					title={translateUI('Add to the reserve')}
				>
					<Icon name="plus-lg" />
				</button>
			</span>
			<button
				type="button"
				className="reserve-icon-button"
				onClick={() => onDrop(entry.name)}
				title={translateUI('Void')}
			>
				<Icon name="x-lg" />
			</button>
		</li>
	);
};

const OptionRow = ({
	option,
	onAdd,
}: {
	option: SynthesisOption;
	onAdd: (name: string) => void;
}) => {
	const { translateMonster, translateUI } = useTranslate();
	const { walkFrom } = useContext(TrailContext);
	const { result, used, rank, plus, gain, owned } = option;
	const label = translateMonster(result.name);
	return (
		<li className={makeClassName('reserve-option', gain > 0 && 'rank-up')}>
			<AnchorLink
				hash={result.name}
				className="reserve-link"
				title={label}
				onNavigate={walkFrom && (() => walkFrom(result.name, option.recipe))}
			>
				<MonsterImg name={result.name} small title={label} />
				<span className="reserve-option-body">
					<span className="reserve-name">{label}</span>
					<span className="reserve-parents">
						{used.map(parent => (
							<span key={parent.name} className="reserve-parent">
								<MonsterImg
									name={parent.name}
									small
									title={translateMonster(parent.name)}
								/>
								{parent.count > 1 && (
									<span className="reserve-times">×{parent.count}</span>
								)}
							</span>
						))}
						{!!rank && (
							<span className="reserve-chip">
								{translateUI('Rank')} {rank}
							</span>
						)}
						{!!plus && <span className="line-point-plus">+{plus}</span>}
					</span>
				</span>
			</AnchorLink>
			<span className="reserve-option-marks">
				{gain > 0 && (
					<span className="reserve-gain" title={translateUI('Rank up')}>
						<Icon name="arrow-up-short" />
						{gain}
					</span>
				)}
				<Rank name={result.rank} className="reserve-rank" />
			</span>
			<button
				type="button"
				className={makeClassName('reserve-icon-button', owned && 'owned')}
				onClick={() => onAdd(result.name)}
				title={translateUI(owned ? 'Already in the reserve' : 'Add to the reserve')}
			>
				<Icon name={owned ? 'check-lg' : 'plus-lg'} />
			</button>
		</li>
	);
};

export default ReserveSidebar;
