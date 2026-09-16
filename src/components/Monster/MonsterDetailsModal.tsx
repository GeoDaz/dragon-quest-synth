import React from 'react';
import { Modal } from 'react-bootstrap';
import {
	GameFarewell,
	GameItems,
	GameTerms,
	Localised,
	MonsterDetails,
} from '@/types/MonsterDetails';
import { Monster as MonsterInterface } from '@/types/Monster';
import useTranslate from '@/hooks/useTranslate';
import Family from './Family';
import Rank from './Rank';
import MonsterImg from './MonsterImg';

const STATS: { key: keyof MonsterDetails['stats']; label: string }[] = [
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
	const { isFr, translateUI } = useTranslate();
	const localised = (entry?: Localised) => (isFr && entry?.fr) || entry?.en;
	const named = (japanese: string, table: GameTerms['traits']) => {
		const term = table[japanese];
		const name = localised(term);
		const title = localised(term?.desc);
		if (!name) {
			return (
				<span className="details-jp" title={title}>
					{japanese}
				</span>
			);
		}
		return <span title={title}>{name}</span>;
	};
	const itemName = (japanese: string) => (
		<span className="details-jp" title={localised(items[japanese])}>
			{japanese}
		</span>
	);
	const label = (isFr && monster.nom) || monster.name;

	const traits = details?.traits || {};
	const levelled = [
		{
			when: `${translateUI('Level')} 1`,
			small: traits.always ? [traits.always] : [],
			large: traits.largeAlways || [],
		},
		{
			when: `${translateUI('Level')} 20`,
			small: traits.level20 ? [traits.level20] : [],
			large: [],
		},
		{
			when: `${translateUI('Level')} 40`,
			small: traits.level40 ? [traits.level40] : [],
			large: [],
		},
		{
			when: `${translateUI('Level')} 60`,
			small: [],
			large: traits.largeLevel60 ? [traits.largeLevel60] : [],
		},
	].filter(entry => entry.small.length || entry.large.length);

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
						<section className="details-block">
							<h5>{translateUI('Statistics')}</h5>
							<dl className="details-stats">
								{STATS.map(stat => (
									<div key={stat.key}>
										<dt>{translateUI(stat.label)}</dt>
										<dd>{details.stats[stat.key]}</dd>
									</div>
								))}
							</dl>
						</section>
						<section className="details-block">
							<ul className="details-misc">
								<li>
									<span>{translateUI('Size')}</span>
									<b>{details.size}</b>
								</li>
								<li>
									<span>{translateUI('Egg')}</span>
									<b>
										{details.egg ?
											translateUI('Yes')
										:	translateUI('No')}
									</b>
								</li>
								{!!details.skill && (
									<li>
										<span>{translateUI('Skill set')}</span>
										<b>{named(details.skill, terms.skills)}</b>
									</li>
								)}
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

						<section className="details-block wide">
							<h5>{translateUI('Traits')}</h5>
							{levelled.length ?
								<table className="details-traits">
									<thead>
										<tr>
											<th scope="col">{translateUI('Size')}</th>
											<th scope="col">S</th>
											<th scope="col">L</th>
										</tr>
									</thead>
									<tbody>
										{levelled.map(entry => (
											<tr key={entry.when}>
												<th scope="row">{entry.when}</th>
												<TraitCell
													names={entry.small}
													terms={terms}
													named={named}
												/>
												<TraitCell
													names={entry.large}
													terms={terms}
													named={named}
												/>
											</tr>
										))}
									</tbody>
								</table>
							:	<p className="cell-empty">&mdash;</p>}
						</section>

						<section className="details-block wide">
							<h5>{translateUI('Resistances')}</h5>
							<ul className="details-resistances">
								{RESISTANCES.map(entry => {
									const value = details.resistances[entry.key] || 0;
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
