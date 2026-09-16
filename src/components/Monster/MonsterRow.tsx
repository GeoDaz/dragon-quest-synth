import Family from './Family';
import Rank from './Rank';
import MonsterImg from './MonsterImg';
import { makeClassName } from '@/functions';
import { Monster as MonsterInterface } from '@/types/Monster';
import AnchorLink from '../AnchorLink';
import { memo, useContext, useState } from 'react';
import useTranslate from '@/hooks/useTranslate';
import { TrailContext } from '@/context/trail';
import Egg from './Egg';
import Icon from '../Icon';
import MonsterDetailsModal from './MonsterDetailsModal';
import { DetailsContext } from '@/context/details';

// A recipe is a flat token list: monster names, "<Family> Family", and at most
// one "Rank <X>" that qualifies every family token of that recipe.
interface Parent {
	name?: string;
	family?: string;
	rank?: string;
	plus?: string;
}
const isCondition = (token: string) =>
	token.includes('Rank') || token.startsWith('Plus ');

const parseRecipe = (list: string[]): Parent[] => {
	const rank = list
		.find(token => token.includes('Rank'))
		?.split(' ')
		.pop();
	const plus = list
		.find(token => token.startsWith('Plus '))
		?.split(' ')
		.pop();
	return list
		.filter(token => !isCondition(token))
		.map(token =>
			token.includes('Family') ?
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
	const { details, terms, farewell, items } = useContext(DetailsContext);
	const [open, setOpen] = useState(false);
	const displayName = (isFr && monster.nom) || monster.name;
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
				<button
					type="button"
					className="btn btn-primary details-button"
					onClick={() => setOpen(true)}
					title={translateUI('Details')}
				>
					<Icon name="text-indent-left" />
				</button>
				{open && (
					<MonsterDetailsModal
						monster={monster}
						details={details[monster.name]}
						terms={terms}
						farewell={farewell}
						items={items}
						open={open}
						handleClose={() => setOpen(false)}
					/>
				)}
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
			<td className="cell-synthesis">
				{monster.synthesis.map((list: string[], i: number) => (
					<div key={i} className="recipe">
						{i > 0 && (
							<span className="recipe-alt">
								&mdash; {translateUI('Or')} &mdash;
							</span>
						)}
						{parseRecipe(list).map((parent, j) => (
							<ParentChip
								key={j}
								parent={parent}
								child={monster.name}
								recipe={list}
							/>
						))}
					</div>
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
		</>
	);
});

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

	// Family parents keep a chip, but the icon already names the family: only the
	// required rank is spelled out. Without a rank there is nothing left to label.
	if (parent.family) {
		const family = translateUI(parent.family);
		const rank =
			parent.rank ?
				`${translateUI('Rank')} ${parent.rank}`
			:	translateUI('Any rank');
		return (
			<AnchorLink
				hash={`${parent.family}-${parent.rank}`}
				className="parent-chip"
				title={`${family} · ${rank}`}
				onNavigate={onNavigate}
			>
				<Family name={parent.family} />
				<span className="chip-label">{rank}</span>
				{!!parent.plus && <PlusBadge plus={parent.plus} />}
				<span className="sr-only">{family}</span>
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
