import Family from './Family';
import MonsterImg from './MonsterImg';
import Rank from './Rank';
import Link from 'next/link';
import { makeClassName } from '@/functions';
import { Card, CardFooter, CardHeader, CardBody } from 'react-bootstrap';
import { useContext } from 'react';
import { MonstersContext } from '@/context/monsters';
import { Monster as MonsterInterface } from '@/types/Monster';

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
					<Family name={monster.family} />{' '}
					{!!monster.to && <Family name={monster.to} />}{' '}
					{!!monster.subfamily &&
						monster.subfamily.map(name => <Family key={name} name={name} />)}
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
								return <Family key={key} name={name} big />;
							}
							const isRank = name.includes('Rank');
							if (isRank) {
								return <Rank key={key} value={'(1) ' + name} />;
							}
							return (
								<Link
									href={`/#${name}`}
									key={key}
									className="line-point pictured thumbnail"
									onClick={e => handleActive(name)}
								>
									<MonsterImg name={name} small />
									<span className="sr-only">{name}</span>
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
