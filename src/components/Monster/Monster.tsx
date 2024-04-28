import { Monster as MonsterType } from '@/types/Monster';
import Family from './Family';
import MonsterImg from './MonsterImg';
import Rank from './Rank';
import Link from 'next/link';
import { makeClassName } from '@/functions';
import { Card, CardFooter, CardHeader, CardBody } from 'react-bootstrap';

const Monster = ({
	monster,
	monsters,
	activeMonster,
	handleActive,
}: {
	monster: MonsterType;
	monsters: { [key: string]: MonsterType };
	activeMonster?: string;
	handleActive: CallableFunction;
}) => {
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
					<div className="d-inline-block position-relative">
						<MonsterImg monster={monster} />
						<Rank value={monster.rank} />
					</div>
				</div>
				<h2 className="text-center">{monster.name}</h2>
			</CardHeader>
			<CardBody>
				<div className="d-flex gap-3">
					<Family name={monster.family} />{' '}
					{!!monster.subfamily &&
						monster.subfamily.map(name => <Family key={name} name={name} />)}
				</div>
				{monster.synthesis.map((list: string[], i: number) => (
					<div key={i} className="d-flex gap-1 mt-3">
						{list.map((name, j) => {
							const isFamily = name.includes('Family');
							if (isFamily) {
								return <Family key={name} name={name} />;
							}
							const submonster = monsters[name];
							const key = monster.name + '_' + i + '_' + j;
							return (
								<Link
									href={`/#${submonster.name}`}
									key={key}
									className="thumbnail"
									onClick={e => handleActive(submonster.name)}
								>
									<MonsterImg monster={submonster} small />
									<span className="sr-only">{submonster.name}</span>
								</Link>
							);
						})}
					</div>
				))}
			</CardBody>
		</Card>
	);
};

export default Monster;
