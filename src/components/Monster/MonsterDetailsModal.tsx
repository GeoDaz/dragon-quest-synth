import React, { useContext, useState } from 'react';
import { Modal } from 'react-bootstrap';
import {
	MonsterStats,
	GameFarewell,
	GameItems,
	GameTerms,
	Localised,
	MonsterDetails,
	MonsterTrait,
} from '@/types/MonsterDetails';
import { Monster as MonsterInterface } from '@/types/Monster';
import useTranslate from '@/hooks/useTranslate';
import { GameContext } from '@/context/game';
import { makeClassName, withoutAlt } from '@/functions';
import Described from '../Described';
import Family from './Family';
import Rank from './Rank';
import MonsterImg from './MonsterImg';
import Talent from './Talent';

const STATS: { key: keyof MonsterStats; label: string }[] = [
	{ key: 'hp', label: 'HP' },
	{ key: 'mp', label: 'MP' },
	{ key: 'attack', label: 'Attack' },
	{ key: 'defence', label: 'Defence' },
	{ key: 'agility', label: 'Agility' },
	{ key: 'wisdom', label: 'Wisdom' },
];

const STAT_SCALE: { [game: string]: number } = {
	DQM1: 3500,
	DQM2: 2000,
	DQM3: 1500,
	DQM4: 1500,
	DQMJ1: 1000,
	DQMJ2: 2600,
	DQMJ3: 2000,
};

type ResistanceGroup = 'Elements' | 'Spells' | 'Status effects';

const RESISTANCES: { key: string; label: string; group: ResistanceGroup }[] = [
	{ key: 'fire', label: 'Fire', group: 'Elements' },
	{ key: 'water', label: 'Water', group: 'Elements' },
	{ key: 'wind', label: 'Wind', group: 'Elements' },
	{ key: 'earth', label: 'Earth', group: 'Elements' },
	{ key: 'explosion', label: 'Explosion', group: 'Elements' },
	{ key: 'freeze', label: 'Ice', group: 'Elements' },
	{ key: 'thunder', label: 'Thunder', group: 'Elements' },
	{ key: 'gravity', label: 'Gravity', group: 'Elements' },
	{ key: 'light', label: 'Light', group: 'Elements' },
	{ key: 'darkness', label: 'Darkness', group: 'Elements' },
	{ key: 'frizz', label: 'Frizz', group: 'Spells' },
	{ key: 'sizz', label: 'Sizz', group: 'Spells' },
	{ key: 'bang', label: 'Bang', group: 'Spells' },
	{ key: 'woosh', label: 'Woosh', group: 'Spells' },
	{ key: 'crack', label: 'Crack', group: 'Spells' },
	{ key: 'rubble', label: 'Rubble', group: 'Spells' },
	{ key: 'zap', label: 'Zap', group: 'Spells' },
	{ key: 'zam', label: 'Zam', group: 'Spells' },
	{ key: 'donk', label: 'Donk', group: 'Spells' },
	{ key: 'fire_breath', label: 'Fire breath', group: 'Spells' },
	{ key: 'ice_breath', label: 'Ice breath', group: 'Spells' },
	{ key: 'weakness', label: 'Debuff', group: 'Status effects' },
	{ key: 'bedazzle', label: 'Bedazzle', group: 'Status effects' },
	{ key: 'resistance', label: 'Resistance down', group: 'Status effects' },
	{ key: 'drain_tension', label: 'Tension drain', group: 'Status effects' },
	{ key: 'hit', label: 'Blunt', group: 'Status effects' },
	{ key: 'seal', label: 'Seal', group: 'Status effects' },
	{ key: 'drain_mp', label: 'MP drain', group: 'Status effects' },
	{ key: 'confusion', label: 'Confusion', group: 'Status effects' },
	{ key: 'sleep', label: 'Sleep', group: 'Status effects' },
	{ key: 'paralysis', label: 'Paralysis', group: 'Status effects' },
	{ key: 'rest', label: 'Stun', group: 'Status effects' },
	{ key: 'poison', label: 'Poison', group: 'Status effects' },
	{ key: 'sudden_death', label: 'Instant death', group: 'Status effects' },
	{ key: 'whack', label: 'Whack', group: 'Status effects' },
	{ key: 'curse', label: 'Curse', group: 'Status effects' },
	{ key: 'immobilize', label: 'Immobilized', group: 'Status effects' },
	{ key: 'dazzle', label: 'Dazzle', group: 'Status effects' },
	{ key: 'drain_magic', label: 'Drain Magic', group: 'Status effects' },
	{ key: 'hack', label: 'Hack', group: 'Status effects' },
	{ key: 'fizzle', label: 'Fizzled', group: 'Status effects' },
	{ key: 'blunt', label: 'Blunted', group: 'Status effects' },
	{ key: 'abiliterator', label: 'Abiliterator', group: 'Status effects' },
	{ key: 'gobstopper', label: 'Gobstopped', group: 'Status effects' },
	{ key: 'ban_dance', label: 'Ban Dance', group: 'Status effects' },
	{ key: 'sag', label: 'Sag', group: 'Status effects' },
	{ key: 'sap', label: 'Sap', group: 'Status effects' },
	{ key: 'decelerate', label: 'Decelerate', group: 'Status effects' },
	{ key: 'dim', label: 'Dim', group: 'Status effects' },
];

const RESISTANCE_GROUPS: ResistanceGroup[] = ['Elements', 'Spells', 'Status effects'];

const TRAIT_TIERS: { [tier: string]: string } = {
	M: 'Mega',
	G: 'Giga',
	SG: 'Ultra',
	Fixed: 'Fixed',
	Initial: 'Initial',
};

const EGG_COLORS: { [color: string]: string } = {
	White: '#f4f4f0',
	Silver: '#b9c2cc',
	Gold: '#e8c35a',
	Rainbow: 'conic-gradient(#f76666, #f0cf7a, #93d25c, #3faae4, #c084fc, #f76666)',
};

type ResistanceFilter = 'all' | 'weak' | 'resist' | 'neutral';

const FILTERS: { key: ResistanceFilter; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'weak', label: 'Weaknesses' },
	{ key: 'resist', label: 'Resistances' },
	{ key: 'neutral', label: 'Neutral' },
];

const resistanceValue = (value: number) => {
	if (value >= 200) return 'Bounce';
	if (value > 100) return 'Heal';
	if (value < 0) return `−${-value}`;
	return value > 0 ? `+${value}` : `${value}`;
};

const resistanceClass = (value: number) => {
	if (value >= 100) return 'immune';
	if (value >= 50) return 'strongly';
	if (value > 0) return 'resist';
	if (value < 0) return 'weak';
	return 'neutral';
};

const resistanceKind = (value: number): Exclude<ResistanceFilter, 'all'> => {
	if (value > 0) return 'resist';
	if (value < 0) return 'weak';
	return 'neutral';
};

interface Props {
	monster: MonsterInterface;
	details?: MonsterDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
	open: boolean;
	handleClose: () => void;
}

const MonsterDetailsModal: React.FC<Props> = ({
	monster,
	details,
	terms,
	farewell,
	items,
	open,
	handleClose,
}) => {
	const { isFr } = useTranslate();
	const label = (isFr && monster.nom) || withoutAlt(monster.name);

	return (
		<Modal
			show={open}
			onHide={handleClose}
			className="monster-details-modal"
			size="lg"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title className="details-title">
					<span className="monster-tile line-point pictured">
						<MonsterImg name={monster.name} title={label} expandable />
					</span>
					<div className="d-flex flex-column gap-2">
						<div className="d-flex gap-2 align-items-center">
							<Family name={monster.family} />
							<div className="break-word">{label}</div>
						</div>
						<Rank name={monster.rank} />
					</div>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="overflow-auto">
				<MonsterDetailsBody
					details={details}
					terms={terms}
					farewell={farewell}
					items={items}
				/>
			</Modal.Body>
		</Modal>
	);
};

export const MonsterDetailsBody = ({
	details,
	terms,
	farewell,
	items,
}: {
	details?: MonsterDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
}) => {
	const { isFr, translateUI, translateTrait } = useTranslate();
	const game = useContext(GameContext);
	const [filter, setFilter] = useState<ResistanceFilter>('all');
	const localised = (entry?: Localised) => (isFr && entry?.fr) || entry?.en;
	const itemName = (japanese: string) => (
		<Described text={localised(items[japanese])} className="details-jp">
			{japanese}
		</Described>
	);

	if (!details) {
		return <p className="cell-empty">{translateUI('No data for this monster.')}</p>;
	}

	const traitTag = (trait: MonsterTrait) => {
		if (trait.level !== undefined) return `${translateUI('Lv.')} ${trait.level}`;
		if (trait.plus !== undefined) return `+${trait.plus}`;
		if (trait.tier) return translateUI(TRAIT_TIERS[trait.tier] || trait.tier);
	};
	const traits = details.traits || [];
	const smallTraits = traits.filter(trait => !trait.large);
	const largeTraits = traits.filter(trait => trait.large);

	const stats = details.stats;
	const statValues = stats ? STATS.map(stat => stats[stat.key] || 0) : [];
	const statScale = (game && STAT_SCALE[game]) || Math.max(1, ...statValues);
	const statTotal = statValues.reduce((sum, value) => sum + value, 0);

	const resisted = RESISTANCES.filter(
		entry => details.resistances?.[entry.key] !== undefined,
	).map(entry => ({
		...entry,
		value: details.resistances?.[entry.key] || 0,
	}));
	const counts: Record<ResistanceFilter, number> = {
		all: resisted.length,
		weak: 0,
		resist: 0,
		neutral: 0,
	};
	resisted.forEach(entry => counts[resistanceKind(entry.value)]++);
	const activeFilter = counts[filter] ? filter : 'all';
	const weaknesses = resisted.filter(entry => entry.value < 0);
	const shown = resisted.filter(
		entry => activeFilter === 'all' || resistanceKind(entry.value) === activeFilter,
	);

	const hasFacts =
		!!details.size ||
		!!details.skill ||
		!!details.skills?.length ||
		!!details.randomSkills?.length ||
		details.egg !== undefined ||
		!!details.eggColor;

	return (
		<div className="details-body">
			{hasFacts && (
				<section className="details-facts" aria-label={translateUI('Misc')}>
					{!!details.size && (
						<div className="details-fact">
							<i className="bi bi-arrows-angle-expand" aria-hidden="true" />
							<div>
								<span>{translateUI('Default size')}</span>
								<b>{details.size}</b>
							</div>
						</div>
					)}
					{(details.egg !== undefined || !!details.eggColor) && (
						<div className="details-fact">
							<i className="bi bi-egg" aria-hidden="true" />
							<div>
								<span>{translateUI('Egg')}</span>
								<b>
									{!!details.eggColor && (
										<span
											className="details-egg-swatch"
											style={{
												background: EGG_COLORS[details.eggColor] || 'var(--dl-muted)',
											}}
										/>
									)}
									{details.eggColor ?
										translateUI(details.eggColor)
									: details.egg ?
										translateUI('Yes')
									:	translateUI('No')}
								</b>
							</div>
						</div>
					)}
					{!!details.skill && (
						<div className="details-fact">
							<i className="bi bi-stars" aria-hidden="true" />
							<div>
								<span>{translateUI('Skill set')}</span>
								<b>
									<Talent name={details.skill} />
								</b>
							</div>
						</div>
					)}
					{!!details.skills?.length && (
						<div className="details-fact grow">
							<i className="bi bi-stars" aria-hidden="true" />
							<div>
								<span>{translateUI('Skill sets')}</span>
								<div className="details-pills">
									{details.skills.map(name => (
										<b key={name} className="details-pill">
											<Talent name={name} />
										</b>
									))}
								</div>
							</div>
						</div>
					)}
					{!!details.randomSkills?.length && (
						<div className="details-fact grow dashed">
							<i className="bi bi-shuffle" aria-hidden="true" />
							<div>
								<span>{translateUI('2nd skill among')}</span>
								<div className="details-pills">
									{details.randomSkills.map(name => (
										<b key={name} className="details-pill">
											<Talent name={name} />
										</b>
									))}
								</div>
							</div>
						</div>
					)}
					{/* {details.drops?.map(drop => (
						<div key={drop.item} className="details-fact">
							<div>
								<span>
									{translateUI('Drop')}
									{drop.rare ? ' ★' : ''}
								</span>
								<b>
									{itemName(drop.item)} &mdash; {drop.rate}%
								</b>
							</div>
						</div>
					))} */}
				</section>
			)}

			{(!!stats || !!traits.length) && (
				<div className="details-grid">
					{!!stats && (
						<section className={makeClassName('details-card', !traits.length && 'wide')}>
							<header className="details-card-header">
								<h5>{translateUI('Statistics')}</h5>
								<span className="details-total">
									{translateUI('Total')} <b>{statTotal}</b>
								</span>
							</header>
							<dl className="details-stats">
								{STATS.map((stat, i) => (
									<div key={stat.key}>
										<dt>{translateUI(stat.label)}</dt>
										<dd className="details-stat-bar" aria-hidden="true">
											<span
												style={{
													width: `${Math.min(100, (statValues[i] / statScale) * 100)}%`,
												}}
											/>
										</dd>
										<dd className="details-stat-value">{statValues[i]}</dd>
									</div>
								))}
							</dl>
						</section>
					)}
					{!!traits.length && (
						<section className={makeClassName('details-card', !stats && 'wide')}>
							<header className="details-card-header">
								<h5>{translateUI('Traits')}</h5>
							</header>
							{!!largeTraits.length && !!smallTraits.length && (
								<span className="details-size-tag">{translateUI('Small size')}</span>
							)}
							<TraitList
								rows={smallTraits}
								terms={terms}
								tag={traitTag}
								translateTrait={translateTrait}
								localised={localised}
							/>
							{!!largeTraits.length && (
								<span className="details-size-tag large">
									{translateUI('Large size')}
								</span>
							)}
							<TraitList
								rows={largeTraits}
								terms={terms}
								tag={traitTag}
								translateTrait={translateTrait}
								localised={localised}
								large
							/>
						</section>
					)}
				</div>
			)}

			{!!resisted.length && (
				<section className="details-card">
					<header className="details-card-header">
						<h5>{translateUI('Resistances')}</h5>
						<div
							className="details-filters"
							role="group"
							aria-label={translateUI('Filter the resistances')}
						>
							{FILTERS.filter(entry => counts[entry.key]).map(entry => (
								<button
									key={entry.key}
									type="button"
									className={makeClassName(
										'details-filter',
										activeFilter === entry.key && 'active',
									)}
									aria-pressed={activeFilter === entry.key}
									onClick={() => setFilter(entry.key)}
								>
									{translateUI(entry.label)}
									<span>{counts[entry.key]}</span>
								</button>
							))}
						</div>
					</header>

					{!!weaknesses.length && (
						<div className="details-weaknesses">
							<i className="bi bi-exclamation-triangle" aria-hidden="true" />
							<span className="details-weaknesses-label">
								{translateUI('Weak points')}
							</span>
							{weaknesses.map(entry => (
								<span key={entry.key} className="details-weakness">
									{translateUI(entry.label)} <b>{resistanceValue(entry.value)}</b>
								</span>
							))}
						</div>
					)}

					{RESISTANCE_GROUPS.map(group => {
						const entries = shown.filter(entry => entry.group === group);
						if (!entries.length) return null;
						return (
							<div key={group} className="details-resistance-group">
								<h6>{translateUI(group)}</h6>
								<ul className="details-resistances">
									{entries.map(entry => {
										const pct = Math.min(100, Math.abs(entry.value));
										return (
											<li key={entry.key} className={resistanceClass(entry.value)}>
												<div className="details-resistance-head">
													<span>{translateUI(entry.label)}</span>
													<b>{translateUI(resistanceValue(entry.value))}</b>
												</div>
												<div className="details-resistance-bar" aria-hidden="true">
													<span>
														<i
															style={{
																width: `${entry.value < 0 ? pct : 0}%`,
															}}
														/>
													</span>
													<span>
														<i
															style={{
																width: `${entry.value > 0 ? pct : 0}%`,
															}}
														/>
													</span>
												</div>
											</li>
										);
									})}
								</ul>
							</div>
						);
					})}

					<ul className="details-legend">
						<li className="weak">{translateUI('Weak')}</li>
						<li className="resist">{translateUI('Resists')}</li>
						<li className="strongly">{translateUI('Strongly resists')}</li>
						<li className="immune">{translateUI('Immune')}</li>
					</ul>
				</section>
			)}

			{/* {!!farewell.items.length && (
				<section className="details-card">
					<h5>{translateUI('Farewell')}</h5>
					<ul className="details-farewell">
						{farewell.items.map(entry => (
							<li key={entry.item}>
								{itemName(entry.item)}
								<b>{entry.rate}%</b>
							</li>
						))}
					</ul>
					<ul className="details-farewell">
						{farewell.amounts.map(entry => (
							<li key={entry.growth}>
								<span>
									{entry.growth ?
										`${translateUI('Growth')} ≥ ${entry.growth}%`
									:	translateUI('Otherwise')}
								</span>
								<b>&times;{entry.count}</b>
							</li>
						))}
					</ul>
				</section>
			)} */}
		</div>
	);
};

const TraitList = ({
	rows,
	terms,
	tag,
	translateTrait,
	localised,
	large,
}: {
	rows: MonsterTrait[];
	terms: GameTerms;
	tag: (trait: MonsterTrait) => string | undefined;
	translateTrait: (name: string) => string;
	localised: (entry?: Localised) => string | undefined;
	large?: boolean;
}) => {
	if (!rows.length) return null;
	const tagged = rows.some(trait => tag(trait) !== undefined);
	return (
		<ol className={makeClassName('details-traits', tagged && 'tagged')}>
			{rows.map((trait, i) => {
				const term = terms.traits[trait.name];
				const desc = localised(term?.desc);
				return (
					<li key={`${trait.name}-${i}`}>
						{tagged && (
							<span className={makeClassName('details-trait-tag', large && 'large')}>
								{tag(trait)}
							</span>
						)}
						<div className="details-trait">
							<b>{translateTrait(term?.en || trait.name)}</b>
							{!!desc && <span>{desc}</span>}
						</div>
					</li>
				);
			})}
		</ol>
	);
};

export default MonsterDetailsModal;
