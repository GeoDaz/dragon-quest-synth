import Family from './Family';
import MonsterImg from './MonsterImg';
import { makeClassName } from '@/functions';
import { Monster as MonsterInterface } from '@/types/Monster';
import AnchorLink from '../AnchorLink';
import { memo } from 'react';
import useTranslate from '@/hooks/useTranslate';
import Egg from './Egg';

// A recipe is a flat token list: monster names, "<Family> Family", and at most
// one "Rank <X>" that qualifies every family token of that recipe.
interface Parent {
	name?: string;
	family?: string;
	rank?: string;
}
const parseRecipe = (list: string[]): Parent[] => {
	const rank = list
		.find(token => token.includes('Rank'))
		?.split(' ')
		.pop();
	return list
		.filter(token => !token.includes('Rank'))
		.map(token =>
			token.includes('Family') ?
				{ family: token.replace(' Family', ''), rank }
			:	{ name: token }
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
	const displayName = (isFr && monster.nom) || monster.name;
	return (
		<>
			<td className="cell-monster">
				<div className="monster-identity">
					<div className="monster-tile line-point pictured">
						<MonsterImg name={monster.name} title={displayName} expandable />
					</div>
					<span className="monster-name">{displayName}</span>
				</div>
			</td>
			<td className="cell-rank">
				{!!monster.rank && <span className="rank-badge">{monster.rank}</span>}
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
			<td className="cell-synthesis">
				{monster.synthesis.map((list: string[], i: number) => (
					<div key={i} className="recipe">
						{i > 0 && (
							<span className="recipe-alt">
								&mdash; {translateUI('Or')} &mdash;
							</span>
						)}
						{parseRecipe(list).map((parent, j) => (
							<ParentChip key={j} parent={parent} />
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

const ParentChip = ({ parent }: { parent: Parent }) => {
	const { translateMonster, translateUI } = useTranslate();

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
			>
				<Family name={parent.family} />
				<span className="chip-label">{rank}</span>
				<span className="sr-only">{family}</span>
			</AnchorLink>
		);
	}

	const name = parent.name as string;
	const label = translateMonster(name);
	return (
		<AnchorLink hash={name} className="parent-tile line-point pictured" title={label}>
			<MonsterImg name={name} small title={label} />
			<span className="sr-only">{name}</span>
		</AnchorLink>
	);
};

export default MonsterRow;
