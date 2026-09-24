import React from 'react';
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
import { makeClassName } from '@/functions';
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

const RESISTANCES: { key: string; label: string }[] = [
	{ key: 'fire', label: 'Fire' },
	{ key: 'water', label: 'Water' },
	{ key: 'wind', label: 'Wind' },
	{ key: 'earth', label: 'Earth' },
	{ key: 'explosion', label: 'Explosion' },
	{ key: 'freeze', label: 'Ice' },
	{ key: 'thunder', label: 'Thunder' },
	{ key: 'light', label: 'Light' },
	{ key: 'darkness', label: 'Darkness' },
	{ key: 'weakness', label: 'Debuff' },
	{ key: 'bedazzle', label: 'Bedazzle' },
	{ key: 'hit', label: 'Blunt' },
	{ key: 'seal', label: 'Seal' },
	{ key: 'drain_mp', label: 'MP drain' },
	{ key: 'confusion', label: 'Confusion' },
	{ key: 'sleep', label: 'Sleep' },
	{ key: 'paralysis', label: 'Paralysis' },
	{ key: 'rest', label: 'Stun' },
	{ key: 'poison', label: 'Poison' },
	{ key: 'sudden_death', label: 'Instant death' },
];

const resistanceClass = (value: number) => {
	if (value >= 100) return 'immune';
	if (value >= 50) return 'strongly';
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
	const { isFr, translateUI, translateTrait } = useTranslate();
	const localised = (entry?: Localised) => (isFr && entry?.fr) || entry?.en;
	const named = (japanese: string, table: GameTerms['traits']) => {
		const term = table[japanese];
		const name = term?.en && translateTrait(term.en);
		return (
			<Described
				text={localised(term?.desc)}
				className={name ? undefined : 'details-jp'}
			>
				{name || japanese}
			</Described>
		);
	};
	const itemName = (japanese: string) => (
		<Described text={localised(items[japanese])} className="details-jp">
			{japanese}
		</Described>
	);
	const label = (isFr && monster.nom) || monster.name;

	const traits = details?.traits || [];
	const smallTraits = traits.filter(trait => !trait.large);
	const largeTraits = traits.filter(trait => trait.large);
	const resisted = RESISTANCES.filter(
		entry => details?.resistances?.[entry.key] !== undefined
	);

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
						<MonsterImg name={monster.name} title={label} />
					</span>
					<span className="break-word">{label}</span>
					<Family big name={monster.family} />
					<Rank big name={monster.rank} />
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="overflow-auto">
				{!details ?
					<p className="cell-empty">
						{translateUI('No data for this monster.')}
					</p>
				:	<div className="details-grid">
						{!!details.stats && (
							<section className="details-block">
								<h5>{translateUI('Statistics')}</h5>
								<dl className="details-stats">
									{STATS.map(stat => (
										<div key={stat.key}>
											<dt>{translateUI(stat.label)}</dt>
											<dd>{details.stats?.[stat.key]}</dd>
										</div>
									))}
								</dl>
							</section>
						)}
						<section
							className={makeClassName(
								'details-block',
								!details.stats && 'wide'
							)}
						>
							<ul className="details-misc">
								{!!details.size && (
									<li>
										<span>{translateUI('Default size')}</span>
										<b>{details.size}</b>
									</li>
								)}
								{!!details.skill && (
									<li>
										<span>{translateUI('Skill set')}</span>
										<b>
											<Talent name={details.skill} />
										</b>
									</li>
								)}
								{!!details.randomSkills?.length && (
									<li className="flex align-items-center">
										<div>{translateUI('2nd skill among')}</div>
										<div>
											{details.randomSkills.map((name, i) => (
												<div key={name} className="text-end">
													<b>
														<Talent name={name} />
													</b>
												</div>
											))}
										</div>
									</li>
								)}
								<li>
									<span>{translateUI('Egg')}</span>
									<b>
										{details.eggColor ?
											translateUI(details.eggColor)
										: details.egg ?
											translateUI('Yes')
										:	translateUI('No')}
									</b>
								</li>
								{/* {details.drops?.map(drop => (
									<li key={drop.item}>
										<span>
											{translateUI('Drop')}
											{drop.rare ? ' ★' : ''}
										</span>
										<b>
											{itemName(drop.item)} &mdash; {drop.rate}%
										</b>
									</li>
								))} */}
							</ul>
						</section>

						<TraitsTable
							size="S"
							rows={smallTraits}
							terms={terms}
							named={named}
							heading={translateUI('Traits')}
							level={translateUI('Level')}
						/>
						<TraitsTable
							size="L"
							rows={largeTraits}
							terms={terms}
							named={named}
							heading={translateUI('Traits')}
							level={translateUI('Level')}
						/>

						{!!resisted.length && (
							<section className="details-block wide">
								<h5>{translateUI('Resistances')}</h5>
								<ul className="details-resistances">
									{resisted.map(entry => {
										const value =
											details.resistances?.[entry.key] || 0;
										return (
											<li
												key={entry.key}
												className={resistanceClass(value)}
											>
												<span>{translateUI(entry.label)}</span>
												<b>{value > 0 ? `+${value}` : value}</b>
											</li>
										);
									})}
								</ul>
							</section>
						)}

						{/* {!!farewell.items.length && (
							<section className="details-block wide">
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
				}
			</Modal.Body>
		</Modal>
	);
};

const TraitsTable = ({
	size,
	rows,
	terms,
	named,
	heading,
	level,
}: {
	size: string;
	rows: MonsterTrait[];
	terms: GameTerms;
	named: (japanese: string, table: GameTerms['traits']) => React.ReactNode;
	heading: string;
	level: string;
}) => {
	if (!rows.length) return null;
	return (
		<section className="details-block">
			<h5>
				{heading} {size}
			</h5>
			<table className="details-traits">
				<tbody>
					{rows.map((trait, i) => (
						<tr key={`${trait.name}-${i}`}>
							<th scope="row">
								{level} {trait.level}
							</th>
							<TraitCell names={[trait.name]} terms={terms} named={named} />
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
};

const TraitCell = ({
	names,
	terms,
	named,
}: {
	names: string[];
	terms: GameTerms;
	named: (japanese: string, table: GameTerms['traits']) => React.ReactNode;
}) => {
	if (!names.length) return <td className="cell-empty">&mdash;</td>;
	return (
		<td>
			<span className="details-trait">
				{names.map(name => (
					<React.Fragment key={name}>
						{named(name, terms.traits)}
					</React.Fragment>
				))}
			</span>
		</td>
	);
};

export default MonsterDetailsModal;
