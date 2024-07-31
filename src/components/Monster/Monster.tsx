import Family from './Family';
import MonsterImg from './MonsterImg';
import Rank from './Rank';
import Link from 'next/link';
import { makeClassName } from '@/functions';
import { Card, CardHeader, CardBody } from 'react-bootstrap';
import { Monster as MonsterInterface } from '@/types/Monster';
import AnchorLink from '../AnchorLink';
import { memo } from 'react';
import useTranslate from '@/hooks/useTranslate';

const Monster = memo(function Monster({
	monster,
	hash,
}: {
	monster: MonsterInterface;
	hash?: string;
}) {
	if (!monster) return null;
	// console.log(hash, monster.name, hash == monster.name);
	return (
		<Card
			id={monster.name}
			className={makeClassName(
				'monster transition',
				hash == monster.name && 'active-outline'
			)}
			style={{ width: '18rem' }}
		>
			<MemoizedInnerMonster monster={monster} />
		</Card>
	);
});

const MemoizedInnerMonster = memo(function InnerMonster({
	monster,
}: {
	monster: MonsterInterface;
}) {
	const { isFr, translateMonster, translateUI } = useTranslate();
	const displayName = translateMonster(monster.name);
	return (
		<>
			<CardHeader>
				<div className="text-center">
					<div className="d-inline-block position-relative line-point pictured">
						<MonsterImg name={monster.name} title={displayName} />
						<Rank value={monster.rank} />
					</div>
				</div>
				<h2 className="text-center">{displayName}</h2>
			</CardHeader>
			<CardBody>
				<div className="fw-bold mb-2">{translateUI('Family')}&nbsp;:</div>
				<div className="d-flex gap-2">
					<Family name={monster.family} activable />{' '}
					{!!monster.to && <Family name={monster.to} activable />}{' '}
					{!!monster.subfamily &&
						monster.subfamily.map(name => (
							<Family key={name} name={name} activable />
						))}
				</div>
				{monster.synthesis.length > 0 && (
					<>
						<div className="fw-bold mt-2 mb-2">
							{translateUI('Synthesis')}&nbsp;:
						</div>
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
											<Family key={key} name={name} big activable />
										);
									}
									const isRank = name.includes('Rank');
									if (isRank) {
										if (isFr) {
											name = name.replace(
												'Rank',
												translateUI('Rank')
											);
										}
										return <Rank key={key} value={'(1) ' + name} />;
									}
									return (
										<AnchorLink
											hash={name}
											key={key}
											className="line-point pictured thumbnail"
										>
											<MonsterImg
												name={name}
												small
												title={translateMonster(name)}
											/>
											<span className="sr-only">{name}</span>
										</AnchorLink>
									);
								})}
							</div>
						))}
					</>
				)}
				{monster.revSynthesis?.length > 0 && (
					<>
						<div className="fw-bold mt-2 mb-2">
							{translateUI('Synthesize into')}&nbsp;:
						</div>
						<div className="sub-monsters d-flex gap-2">
							{monster.revSynthesis?.map((name: string, i: number) => (
								<AnchorLink
									key={i}
									hash={name}
									className="line-point pictured thumbnail"
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
					</>
				)}
			</CardBody>
		</>
	);
});

export default Monster;
