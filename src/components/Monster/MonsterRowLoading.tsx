import { makeClassName } from '@/functions';
import { Spinner } from 'react-bootstrap';
import { Monster as MonsterInterface } from '@/types/Monster';
import Rank from './Rank';

const MonsterRowLoading = ({
	monster,
	hash,
}: {
	monster: MonsterInterface;
	hash?: string;
}) => {
	if (!monster) return null;
	return (
		<tr
			id={monster.name}
			className={makeClassName(
				'monster transition',
				hash == monster.name && 'active-outline'
			)}
		>
			<td className="cell-monster">
				<div className="monster-identity">
					<div className="monster-tile line-point pictured">
						<div className="line-point-safe-zone">
							<div className="spinner-wrapper">
								<Spinner animation="grow" />
							</div>
						</div>
					</div>
					<span className="monster-name">{monster.name}</span>
				</div>
			</td>
			<td className="cell-details" />
			<td className="cell-family">
				<div className="family-icons">
					<Skeleton size={30} />
				</div>
			</td>
			<td className="cell-rank">
				<Rank name={monster.rank} />
			</td>
			<td className="cell-synthesis">
				{monster.synthesis.map((list: string[], i: number) => {
					// a rank token turns its family tokens into labelled chips,
					// every other parent is a bare tile
					const chip = list.some(token => token.includes('Rank'));
					return (
						<div key={i} className="recipe">
							{list
								.filter(
									token =>
										!token.includes('Rank') &&
										!token.startsWith('Plus ')
								)
								.map((token, j) => (
									<Skeleton
										key={j}
										size={32}
										width={chip && token.includes('Family') ? 92 : 32}
									/>
								))}
						</div>
					);
				})}
				{!!monster.egg && <Skeleton size={32} width={110} />}
			</td>
			<td className="cell-rev-synthesis">
				<div className="into-tiles">
					{monster.revSynthesis?.map((_, i: number) => (
						<Skeleton key={i} size={38} />
					))}
				</div>
			</td>
		</tr>
	);
};

const Skeleton = ({ size, width }: { size: number; width?: number }) => (
	<span className="row-skeleton" style={{ height: size, width: width || size }} />
);

export default MonsterRowLoading;
