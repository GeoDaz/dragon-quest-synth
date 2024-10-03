import { makeClassName } from '@/functions';
import { Card, CardHeader, CardBody, Spinner } from 'react-bootstrap';
import { Monster as MonsterInterface } from '@/types/Monster';
import { memo } from 'react';
import useTranslate from '@/hooks/useTranslate';
import Rank from './Rank';

const MonsterLoading = ({ monster, hash }: { monster: MonsterInterface; hash?: string }) => {
	if (!monster) return null;
	return (
		<Card
			id={monster.name}
			className={makeClassName(
				'monster transition',
				hash == monster.name && 'active-outline'
			)}
			style={{ minHeight: `${416 / 15}rem`, width: '18rem' }}
		>
			<MemoizedInnerMonster monster={monster} />
		</Card>
	);
};

const MemoizedInnerMonster = memo(function InnerMonster({
	monster,
}: {
	monster: MonsterInterface;
}) {
	const { isFr, translateUI } = useTranslate();
	const displayName = (isFr && monster.nom) || monster.name;
	return (
		<>
			<CardHeader>
				<div className="text-center">
					<div className="d-inline-block position-relative line-point pictured">
						<ImgLoading />
					</div>
				</div>
				<h2 className="text-center">{displayName}</h2>
			</CardHeader>
			<CardBody>
				<div className="fw-bold mb-2">{translateUI('Family')}&nbsp;:</div>
				<div className="d-flex gap-2">
					<FamilyLoading />
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
									'sub-monsters d-flex gap-2 flex-wrap',
									i > 0 && 'mt-2'
								)}
							>
								{list.map((name, j) => {
									const isFamily = name.includes('Family');
									if (isFamily) {
										const rank = list
											.find(n => n.includes('Rank'))
											?.slice(-1);
										name = name.replace(' Family', '');
										return (
											<div key={j} className="line-point pictured thumbnail">
												<ImgLoading />
											</div>
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
										return <Rank key={j} value={'(1) ' + name} />;
									}
									return (
										<div key={j} className="line-point pictured thumbnail">
											<ImgLoading />
										</div>
									);
								})}
							</div>
						))}
					</>
				)}
				{!!monster.egg && (
					<div className="fw-bold mt-2 mb-2">
						<FamilyLoading />
					</div>
				)}
				{monster.revSynthesis?.length > 0 && (
					<>
						<div className="fw-bold mt-2 mb-2">
							{translateUI('Synthesize into')}&nbsp;:
						</div>
						<div className="sub-monsters d-flex gap-2 flex-wrap">
							{monster.revSynthesis?.map((name: string, i: number) => (
								<div key={i} className="line-point pictured thumbnail">
									<ImgLoading />
								</div>
							))}
						</div>
					</>
				)}
			</CardBody>
		</>
	);
});

const ImgLoading = () => {
	return (
		<div className="line-point-safe-zone">
			<div className="spinner-wrapper">
				<Spinner animation="grow" />
			</div>
		</div>
	);
};

const FamilyLoading = () => {
	return <div className="spinner-wrapper" style={{ height: '30px', width: '30px' }}>
		<Spinner animation="grow" />
	</div>
};

export default MonsterLoading;
