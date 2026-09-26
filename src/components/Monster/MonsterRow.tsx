import Family from './Family';
import Rank from './Rank';
import Lower from './Lower';
import Talent from './Talent';
import MonsterImg from './MonsterImg';
import { LOWER } from '@/hooks/useSynthesisTrail';
import { makeClassName } from '@/functions';
import { Monster as MonsterInterface } from '@/types/Monster';
import AnchorLink from '../AnchorLink';
import { Fragment, memo, useContext, useState } from 'react';
import useTranslate from '@/hooks/useTranslate';
import { TrailContext } from '@/context/trail';
import Egg from './Egg';
import Icon from '../Icon';
import MonsterDetailsModal from './MonsterDetailsModal';
import { DetailsContext } from '@/context/details';
import { areasNames, seasonsIcons, weathersIcons } from '@/consts/data';
import { StringObject } from '@/types/Ui';
import { Spawn } from '@/types/MonsterDetails';
import { ReserveContext } from '@/context/reserve';
import MonsterImgModal from './MonsterImgModal';

interface Parent {
	name?: string;
	family?: string;
	rank?: string;
	plus?: string;
	lower?: boolean;
}
const isCondition = (token: string) =>
	token.includes('Rank') || token.startsWith('Plus ');

const parseRecipe = (list: string[]): Parent[] => {
	const rankString = list.find(t => t.includes('Rank'));
	const rank = rankString?.slice(rankString.indexOf(' ') + 1);
	const plus = list
		.find(token => token.startsWith('Plus '))
		?.split(' ')
		.pop();
	return list
		.filter(token => !isCondition(token))
		.map(token =>
			token == LOWER ? { lower: true, plus }
			: token.includes('Family') ?
				{ family: token.replace(' Family', ''), rank, plus }
			:	{ name: token, plus }
		);
};

const MonsterRow = ({ monster, hash }: { monster: MonsterInterface; hash?: string }) => {
	if (!monster) return null;
	return (
		<tr
			id={monster.name}
			className={makeClassName(
				'monster transition',
				hash == monster.name && 'active-outline'
			)}
		>
			<MemoizedMonsterCells monster={monster} />
		</tr>
	);
};

const MemoizedMonsterCells = memo(function MonsterCells({
	monster,
}: {
	monster: MonsterInterface;
}) {
	const { isFr, translateMonster, translateUI } = useTranslate();
	const { walkInto, addDefault } = useContext(TrailContext);
	const { details, terms, farewell, items, spawns, hasDetails, hasSpawns } =
		useContext(DetailsContext);
	const { stock, goals, addToReserve, openReserve, toggleGoal } =
		useContext(ReserveContext);
	const isGoal = !!goals?.includes(monster.name);
	const active = stock?.[monster.name] || 0;
	const [open, setOpen] = useState(false);
	const displayName = (isFr && monster.nom) || monster.name;
	const skill = details[monster.name]?.skill;
	const places = spawns[monster.name];
	return (
		<>
			<td className="cell-monster">
				<div className="monster-identity">
					<div
						className={makeClassName(
							'monster-tile line-point pictured',
							addDefault && 'click'
						)}
						onClick={addDefault && (() => addDefault(monster.name))}
					>
						<MonsterImg name={monster.name} title={displayName} />
					</div>
					<span className="monster-name">{displayName}</span>
				</div>
			</td>
			<td className="cell-details">
				<div className="row-actions">
					{/* {hasDetails && ( */}
					<button
						type="button"
						className="btn btn-primary details-button"
						onClick={() => setOpen(true)}
					>
						<Icon name={hasDetails ? 'text-indent-left' : 'zoom-in'} />
						{/*  {translateUI('Details')} */}
					</button>
					{/* )} */}
					{/* <div className="d-flex gap-2"> */}
					{!!addToReserve && (
						<button
							type="button"
							className={makeClassName(
								'btn btn-primary details-button reserve-button',
								!!active && 'active'
							)}
							onClick={() => {
								addToReserve(monster.name);
								if (openReserve) openReserve();
							}}
						>
							<Icon name="box-seam" />
							{/*  {translateUI('Reserve')} */}{' '}
							{/* {active > 1 && (
								<span className="reserve-times">×{active}</span>
							)} */}
						</button>
					)}
					{!!toggleGoal && (
						<button
							type="button"
							className={makeClassName(
								'btn btn-primary details-button reserve-button goal-button',
								isGoal && 'active'
							)}
							aria-pressed={isGoal}
							title={translateUI(
								isGoal ? 'Remove from goals' : 'Add as a goal'
							)}
							onClick={() => {
								toggleGoal(monster.name);
								if (!isGoal && openReserve) openReserve();
							}}
						>
							<Icon name="bullseye" /> {/* {translateUI('Goal')} */}
						</button>
					)}
					{/* </div> */}
				</div>
				{open &&
					(hasDetails ?
						<MonsterDetailsModal
							monster={monster}
							details={details[monster.name]}
							terms={terms}
							farewell={farewell}
							items={items}
							open
							handleClose={() => setOpen(false)}
						/>
					:	<MonsterImgModal
							name={monster.name}
							open
							handleClose={() => setOpen(false)}
						/>)}
			</td>
			<td className="cell-family">
				<div className="family-icons">
					<Family name={monster.family} activable />
					{!!monster.to && <Family name={monster.to} activable />}
					{monster.subfamily?.map(name => (
						<Family key={name} name={name} activable />
					))}
				</div>
			</td>
			<td className="cell-rank">
				<Rank name={monster.rank} />
			</td>
			{hasDetails && (
				<td className="cell-skill">
					{skill ?
						<Talent name={skill} />
					:	<span className="cell-empty">&mdash;</span>}
				</td>
			)}
			<td className="cell-synthesis">
				{monster.synthesis.map((list: string[], i: number) => (
					<Fragment key={i}>
						{i > 0 && (
							<div className="recipe-alt">
								&mdash; {translateUI('Or')} &mdash;
							</div>
						)}
						<div className="recipe">
							{parseRecipe(list).map((parent, j) => (
								<ParentChip
									key={j}
									parent={parent}
									child={monster.name}
									recipe={list}
								/>
							))}
						</div>
					</Fragment>
				))}
				{!!monster.egg && (
					<div className="recipe">
						<span className="parent-chip egg-chip">
							<Egg name={monster.egg} />
							<span className="chip-label">
								{translateUI('Egg')} {translateUI(monster.egg)}
							</span>
						</span>
					</div>
				)}
				{!monster.synthesis?.length && !monster.egg && (
					<span className="cell-empty">&mdash;</span>
				)}
			</td>
			<td className="cell-rev-synthesis">
				{monster.revSynthesis?.length > 0 ?
					<div className="into-tiles">
						{monster.revSynthesis.map((name: string, i: number) => (
							<AnchorLink
								key={i}
								hash={name}
								className="into-tile line-point pictured"
								title={translateMonster(name)}
								onNavigate={
									walkInto && (() => walkInto(monster.name, name))
								}
							>
								<MonsterImg
									name={name}
									small
									title={translateMonster(name)}
								/>
								<span className="sr-only">{name}</span>
							</AnchorLink>
						))}
					</div>
				:	<span className="cell-empty">&mdash;</span>}
			</td>
			{hasSpawns && (
				<td className="cell-spawn">
					{places?.length ?
						places.map(place => <SpawnChip key={place.area} spawn={place} />)
					:	<span className="cell-empty">&mdash;</span>}
				</td>
			)}
		</>
	);
});

const TIME_ICONS: { [time: string]: string } = {
	always: 'brightness-alt-high',
	day: 'sun',
	night: 'moon',
};
const TIME_LABELS: { [time: string]: string } = {
	always: 'Day and night',
	day: 'Day',
	night: 'Night',
};

const SpawnChip = ({ spawn }: { spawn: Spawn }) => {
	const { translateUI } = useTranslate();
	const area = areasNames[spawn.area] || spawn.area;
	const when = [
		...(spawn.time ? [TIME_LABELS[spawn.time]] : []),
		...(spawn.seasons || []),
		...(spawn.weathers || []),
	].map(value => translateUI(value));
	return (
		<span className="spawn-chip" title={[area, ...when].join(' · ')}>
			<span className="spawn-area">
				{!!spawn.time && (
					<Icon
						name={TIME_ICONS[spawn.time]}
						title={translateUI(TIME_LABELS[spawn.time])}
					/>
				)}
				<span className="chip-label">{area}</span>
			</span>
			<SpawnWhen
				label={translateUI('Season')}
				values={spawn.seasons}
				icons={seasonsIcons}
			/>
			<SpawnWhen
				label={translateUI('Weather')}
				values={spawn.weathers}
				icons={weathersIcons}
			/>
		</span>
	);
};

const SpawnWhen = ({
	label,
	values,
	icons,
}: {
	label: string;
	values?: string[];
	icons: StringObject;
}) => {
	const { translateUI } = useTranslate();
	if (!values?.length) return null;
	return (
		<span className="spawn-when">
			<span className="spawn-when-label">{label}&nbsp;:</span>
			{values.map(value => {
				const icon = icons[value];
				if (!icon) return null;
				return <Icon key={value} name={icon} title={translateUI(value)} />;
			})}
		</span>
	);
};

const ParentChip = ({
	parent,
	child,
	recipe,
}: {
	parent: Parent;
	child: string;
	recipe: string[];
}) => {
	const { translateMonster, translateUI } = useTranslate();
	const { walkFrom } = useContext(TrailContext);
	// the whole recipe is grafted, so a family chip walks the trail too
	const onNavigate = walkFrom && (() => walkFrom(child, recipe));

	if (parent.lower) {
		return (
			<span className="parent-lower">
				<Lower />
				{!!parent.plus && <PlusBadge plus={parent.plus} />}
			</span>
		);
	}

	// Family parents keep a chip, but the icon already names the family: only the
	// required rank is spelled out. Without a rank there is nothing left to label.
	if (parent.family) {
		const family = translateUI(parent.family);
		const rank =
			parent.rank ?
				`${translateUI('Rank')} ${parent.rank.length > 1 ? translateUI(parent.rank) : parent.rank}`
			:	translateUI('Any rank');
		return (
			<AnchorLink
				hash={`${parent.family}-${parent.rank}`}
				className="parent-chip"
				title={`${family} · ${rank}`}
				onNavigate={onNavigate}
			>
				<Family name={parent.family} />
				<span className="sr-only">{family}</span>
				<span className="chip-label">{rank}</span>
			</AnchorLink>
		);
	}

	const name = parent.name as string;
	const label = translateMonster(name);
	return (
		<AnchorLink
			hash={name}
			className="parent-tile line-point pictured"
			title={label}
			onNavigate={onNavigate}
		>
			<MonsterImg name={name} small title={label} />
			{!!parent.plus && (
				<span className="line-point-badges">
					<PlusBadge plus={parent.plus} />
				</span>
			)}
			<span className="sr-only">{name}</span>
		</AnchorLink>
	);
};

const PlusBadge = ({ plus }: { plus: string }) => (
	<span className="line-point-plus" title={`+${plus}`}>
		+{plus}
	</span>
);

export default MonsterRow;
