import { memo, useContext } from 'react';
import Described from '../Described';
import useTranslate from '@/hooks/useTranslate';
import { DetailsContext } from '@/context/details';
import { makeClassName } from '@/functions';
import { Localised } from '@/types/MonsterDetails';

const Talent = memo(function Talent({ name }: { name: string }) {
	const { isFr, translateMove, translateSkill, translateTrait, translateUI } =
		useTranslate();
	const { terms, talents } = useContext(DetailsContext);
	const localised = (entry?: Localised) => (isFr && entry?.fr) || entry?.en;
	const term = terms.skills[name];
	const label = translateSkill(term?.en || name);
	const desc = localised(term?.desc);
	const talent = talents.talents[name];

	const content =
		talent ?
			<>
				{!!desc && <p className="talent-desc">{desc}</p>}
				<table className="talent-steps">
					<thead>
						<tr>
							<th className="pe-1">{translateUI('Skill')}</th>
							<th className="ps-1">{translateUI('Level')}</th>
						</tr>
					</thead>
					<tbody>
						{talent.moves.map(({ move, sp }, i) => {
							const isTrait = !!talent.traits?.includes(move);
							const moveName =
								isTrait ?
									translateTrait(terms.traits[move]?.en || move)
								:	translateMove(talents.moves[move]?.en || move);
							return (
								<tr
									key={`${sp}-${i}`}
									className={makeClassName(isTrait && 'talent-trait')}
								>
									<td className="talent-move">{moveName}</td>
									<td className="talent-sp">{sp}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</>
		:	desc;

	return (
		<Described
			text={content}
			className={makeClassName(!term && 'details-jp')}
			popoverClassName={talent && 'talent-popover'}
		>
			{label}
		</Described>
	);
});

export default Talent;
