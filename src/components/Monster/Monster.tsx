import Family from './Family';
import MonsterImg from './MonsterImg';
import Rank from './Rank';
import Link from 'next/link';
import { makeClassName } from '@/functions';
import { Card, CardHeader, CardBody } from 'react-bootstrap';
import { Monster as MonsterInterface } from '@/types/Monster';
import AnchorLink from '../AnchorLink';

const Monster = ({
	monster,
	activeMonster,
	handleActive,
}: {
	monster: MonsterInterface;
	activeMonster?: string;
	handleActive: CallableFunction;
}) => {
	if (!monster) return null;
	return (
		<Card
			id={monster.name}
			className={makeClassName(
				'monster',
				activeMonster === monster.name &&
					'outline outline-2 outline-offset-2 outline-indigo-500'
			)}
			style={{ width: '18rem' }}
		>
			<CardHeader>
				<div className="text-center">
					<div className="d-inline-block position-relative line-point pictured">
						<MonsterImg name={monster.name} />
						<Rank value={monster.rank} />
					</div>
				</div>
				<h2 className="text-center">{monster.name}</h2>
			</CardHeader>
			<CardBody>
				<div className="fw-bold mb-2">Family&nbsp;:</div>
				<div className="d-flex gap-2 mb-2">
					<Family name={monster.family} handleActive={handleActive} />{' '}
					{!!monster.to && (
						<Family name={monster.to} handleActive={handleActive} />
					)}{' '}
					{!!monster.subfamily &&
						monster.subfamily.map(name => (
							<Family key={name} name={name} handleActive={handleActive} />
						))}
				</div>
				<div className="fw-bold mb-2">Synthesis&nbsp;:</div>
				{monster.synthesis.map((list: string[], i: number) => (
					<div
						key={i}
						className={makeClassName(
							'sub-monsters d-flex gap-2',
							i > 0 && 'mt-2'
						)}
					>
						{list.map((name, j) => {
							const key = name + '_' + i + '_' + j;
							const isFamily = name.includes('Family');
							if (isFamily) {
								name = name.replace(' Family', '');
								return (
									<Family
										key={key}
										name={name}
										big
										handleActive={handleActive}
									/>
								);
							}
							const isRank = name.includes('Rank');
							if (isRank) {
								return <Rank key={key} value={'(1) ' + name} />;
							}
							return (
								<AnchorLink
									hash={name}
									key={key}
									className="line-point pictured thumbnail"
								>
									<MonsterImg name={name} small />
									<span className="sr-only">{name}</span>
								</AnchorLink>
							);
						})}
					</div>
				))}
			</CardBody>
		</Card>
	);
};

export default Monster;
