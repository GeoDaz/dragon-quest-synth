import { memo, useContext } from 'react';
import Described from '../Described';
import useTranslate from '@/hooks/useTranslate';
import { DetailsContext } from '@/context/details';
import { makeClassName } from '@/functions';
import { Localised } from '@/types/MonsterDetails';

const Talent = memo(function Talent({ name }: { name: string }) {
	const { isFr } = useTranslate();
	const { terms, talents } = useContext(DetailsContext);
	const localised = (entry?: Localised) => (isFr && entry?.fr) || entry?.en;
	const term = terms.skills[name];
	const label = localised(term) || name;
	const desc = localised(term?.desc);
	const talent = talents.talents[name];

	const content =
		talent ?
			<>
				{!!desc && <p className="talent-desc">{desc}</p>}
				<ol className="talent-steps">
					{talent.moves.map(({ move, sp }, i) => {
						const isTrait = !!talent.traits?.includes(move);
						const moveName =
							(isTrait ?
								localised(terms.traits[move])
							:	localised(talents.moves[move])) || move;
						return (
							<li
								key={`${sp}-${i}`}
								className={makeClassName(
									'd-flex justify-content-between',
									isTrait && 'talent-trait'
								)}
							>
								<span>{moveName}</span>
								<span className="talent-sp">lvl {sp}</span>
							</li>
						);
					})}
				</ol>
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
