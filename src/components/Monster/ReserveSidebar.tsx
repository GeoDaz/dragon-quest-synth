import { useContext, useEffect, useMemo, useState } from 'react';
import { Monster, Monsters } from '@/types/Monster';
import {
	ReserveEntry,
	ReserveStock,
	SynthesisOption,
	GoalRecipe,
	familyOf,
	goalRecipes,
	possibleSyntheses,
	rankIndexer,
} from '@/functions/reserve';
import Family from './Family';
import Lower from './Lower';
import { makeClassName } from '@/functions';
import useTranslate from '@/hooks/useTranslate';
import { TrailContext } from '@/context/trail';
import AnchorLink from '../AnchorLink';
import Icon from '../Icon';
import MonsterImg from './MonsterImg';
import Rank from './Rank';
import { Button } from 'react-bootstrap';

const PAGE_SIZE = 30;

interface Props {
	entries: ReserveEntry[];
	stock: ReserveStock;
	monsters: Monsters;
	ranks: string[];
	open: boolean;
	expanded: boolean;
	onToggle: () => void;
	onToggleExpanded: () => void;
	onAdd: (name: string) => void;
	onRemove: (name: string) => void;
	onDrop: (name: string) => void;
	onClear: () => void;
	goals: string[];
	onToggleGoal: (name: string) => void;
	onClearGoals: () => void;
}

const ReserveSidebar: React.FC<Props> = ({
	entries,
	stock,
	monsters,
	ranks,
	open,
	expanded,
	onToggle,
	onToggleExpanded,
	onAdd,
	onRemove,
	onDrop,
	onClear,
	goals,
	onToggleGoal,
	onClearGoals,
}) => {
	const [shown, setShown] = useState(PAGE_SIZE);
	const { translateUI } = useTranslate();
	const options = useMemo(
		() => (open ? possibleSyntheses(monsters, stock, ranks) : []),
		[open, monsters, stock, ranks]
	);
	const sortedEntries = useMemo(() => {
		const rankIndex = rankIndexer(ranks);
		return [...entries].sort(
			(a, b) =>
				rankIndex(monsters[a.name]?.rank) - rankIndex(monsters[b.name]?.rank)
		);
	}, [entries, monsters, ranks]);
	const total = entries.reduce((sum, entry) => sum + entry.count, 0);

	useEffect(() => {
		setShown(PAGE_SIZE);
	}, [stock]);

	return (
		<aside
			className={makeClassName(
				'reserve-sidebar',
				open && 'open',
				open && expanded && 'expanded'
			)}
		>
			<div className="reserve-handle">
				{open && (
					<Button
						variant="outline"
						type="button"
						onClick={onToggleExpanded}
						aria-expanded={open}
						title={translateUI(
							expanded ? 'Shrink the reserve' : 'Expend the reserve'
						)}
					>
						<Icon name={expanded ? 'chevron-right' : 'chevron-left'} />
					</Button>
				)}
				{!expanded && (
					<Button
						variant="outline"
						type="button"
						onClick={onToggle}
						aria-expanded={open}
						title={translateUI(
							open ? 'Close the reserve' : 'Open the reserve'
						)}
					>
						<Icon name={open ? 'chevron-right' : 'chevron-left'} />
					</Button>
				)}
				<Icon name="box-seam" className="reserve-handle-icon" />
				{!!total && <span className="reserve-badge">{total}</span>}
			</div>
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
						<button
							type="button"
							className="reserve-icon-button reserve-expand"
							onClick={onToggleExpanded}
							aria-pressed={expanded}
							title={translateUI(
								expanded ? 'Shrink the reserve' : 'Expand the reserve'
							)}
						>
							<Icon
								name={
									expanded ?
										'arrows-angle-contract'
									:	'arrows-angle-expand'
								}
							/>
						</button>
					</header>
					<div className="reserve-body">
						{!!goals.length && (
							<section className="reserve-section reserve-goals">
								<h3 className="reserve-subtitle">
									<Icon name="bullseye" /> {translateUI('Goals')}
									<span className="reserve-count">{goals.length}</span>
									<button
										type="button"
										className="reserve-icon-button ms-auto"
										onClick={onClearGoals}
										title={translateUI('Clear the goals')}
									>
										<Icon name="trash" />
									</button>
								</h3>
								<ul className="reserve-options">
									{goals.map(name =>
										monsters[name] ?
											<GoalRow
												key={name}
												goal={monsters[name]}
												monsters={monsters}
												stock={stock}
												ranks={ranks}
												onRemove={onToggleGoal}
											/>
										:	null
									)}
								</ul>
							</section>
						)}
						<section className="reserve-section">
							<h3 className="reserve-subtitle">
								<Icon name="box-seam" /> {translateUI('Monsters in reserve')}
								{!!total && <span className="reserve-count">{total}</span>}
							</h3>
							{entries.length ?
								<ul className="reserve-list">
									{sortedEntries.map(entry => (
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
						</section>
						{!!entries.length && (
							<section className="reserve-section">
								<h3 className="reserve-subtitle">
									{translateUI('Possible syntheses')}
									<span className="reserve-count">
										{options.length}
									</span>
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
												onClick={() =>
													setShown(shown + PAGE_SIZE)
												}
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

const GoalRow = ({
	goal,
	monsters,
	stock,
	ranks,
	onRemove,
}: {
	goal: Monster;
	monsters: Monsters;
	stock: ReserveStock;
	ranks: string[];
	onRemove: (name: string) => void;
}) => {
	const { translateMonster, translateUI } = useTranslate();
	const { walkFrom } = useContext(TrailContext);
	const recipes = useMemo(
		() => goalRecipes(goal, monsters, stock, ranks),
		[goal, monsters, stock, ranks]
	);
	const ready = recipes.some(recipe => !!recipe.combo);
	const [unfolded, setUnfolded] = useState(false);
	const label = translateMonster(goal.name);
	return (
		<li className={makeClassName('reserve-option reserve-goal', ready && 'ready')}>
			<AnchorLink
				hash={goal.name}
				className="reserve-link"
				title={label}
				onNavigate={
					walkFrom &&
					recipes[0] &&
					(() => walkFrom(goal.name, recipes[0].recipe))
				}
			>
				<MonsterImg name={goal.name} small title={label} />
				<span className="reserve-option-body">
					<span className="reserve-name">{label}</span>
					{recipes.length ?
						(unfolded ? recipes : recipes.slice(0, 1)).map((recipe, i) => (
							<GoalRecipeLine key={i} recipe={recipe} />
						))
					:	<span className="reserve-goal-none">
							{translateUI('No synthesis for this monster.')}
						</span>
					}
				</span>
			</AnchorLink>
			<span className="reserve-option-marks">
				<span
					className={makeClassName('reserve-goal-status', ready && 'ready')}
					title={translateUI(ready ? 'Ready to synthesize' : 'Missing components')}
				>
					<Icon name={ready ? 'check-circle-fill' : 'hourglass-split'} />
				</span>
				<Rank name={goal.rank} className="reserve-rank" />
				{recipes.length > 1 && (
					<button
						type="button"
						className="reserve-goal-more"
						onClick={() => setUnfolded(!unfolded)}
						aria-expanded={unfolded}
						title={translateUI(
							unfolded ? 'Hide other syntheses' : 'Show other syntheses'
						)}
					>
						{unfolded ?
							<Icon name="chevron-up" />
						:	`+${recipes.length - 1}`}
					</button>
				)}
			</span>
			<button
				type="button"
				className="reserve-icon-button"
				onClick={() => onRemove(goal.name)}
				title={translateUI('Remove from goals')}
			>
				<Icon name="x-lg" />
			</button>
		</li>
	);
};

const GoalRecipeLine = ({ recipe }: { recipe: GoalRecipe }) => {
	const { translateMonster, translateUI } = useTranslate();
	const { parts, combo, rank, rankOk, plus } = recipe;
	return (
		<span className={makeClassName('reserve-parents reserve-goal-recipe', !!combo && 'ready')}>
			{combo ?
				combo.map(parent => (
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
				))
			:	parts.map((part, i) => (
					<span
						key={i}
						className={makeClassName(
							'reserve-parent reserve-goal-part',
							part.ok ? 'owned' : 'missing'
						)}
					>
						{part.kind == 'lower' ?
							<Lower />
						: part.kind == 'family' ?
							<Family name={familyOf(part.token)} />
						:	<MonsterImg
								name={part.token}
								small
								title={translateMonster(part.token)}
							/>
						}
					</span>
				))
			}
			{!!rank && (
				<span
					className={makeClassName(
						'reserve-chip',
						!combo && (rankOk ? 'owned' : 'missing')
					)}
				>
					{translateUI('Rank')} {rank}
				</span>
			)}
			{!!plus && <span className="line-point-plus">+{plus}</span>}
		</span>
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
	const { result, used, alternatives, rank, plus, gain, owned } = option;
	const label = translateMonster(result.name);
	const renderParents = (parents: ReserveEntry[], key?: number) => (
		<span key={key} className="reserve-parents">
			{parents.map(parent => (
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
	);
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
					{renderParents(used)}
					{alternatives.map((parents, i) => renderParents(parents, i))}
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
				title={translateUI(
					owned ? 'Already in the reserve' : 'Add to the reserve'
				)}
			>
				<Icon name={owned ? 'check-lg' : 'plus-lg'} />
			</button>
		</li>
	);
};

export default ReserveSidebar;
