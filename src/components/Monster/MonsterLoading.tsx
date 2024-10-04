import { makeClassName } from '@/functions';
import { Card, CardHeader, CardBody, Spinner } from 'react-bootstrap';
import { Monster as MonsterInterface } from '@/types/Monster';

const MonsterLoading = ({
	monster,
	hash,
}: {
	monster: MonsterInterface;
	hash?: string;
}) => {
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
			<CardHeader>
				<div className="text-center">
					<div className="d-inline-block position-relative line-point pictured">
						<ImgLoading />
					</div>
				</div>
				<h2 className="text-center">{monster.name}</h2>
			</CardHeader>
			<CardBody>
				<div className="fw-bold mb-2">Family&nbsp;:</div>
				<div className="d-flex gap-2">
					<FamilyLoading />
				</div>
				{monster.synthesis.length > 0 && (
					<>
						<div className="fw-bold mt-2 mb-2">Synthesis&nbsp;:</div>
						{monster.synthesis.map((list: string[], i: number) => (
							<div
								key={i}
								className={makeClassName(
									'sub-monsters d-flex gap-2 flex-wrap',
									i > 0 && 'mt-2'
								)}
							>
								{list.map((_, j) => (
									<ThumbLoading key={j} />
								))}
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
						<div className="fw-bold mt-2 mb-2">Synthesize into&nbsp;:</div>
						<div className="sub-monsters d-flex gap-2 flex-wrap">
							{monster.revSynthesis?.map((_, i: number) => (
								<ThumbLoading key={i} />
							))}
						</div>
					</>
				)}
			</CardBody>
		</Card>
	);
};

const ImgLoading = () => {
	return (
		<div className="line-point-safe-zone">
			<div className="spinner-wrapper">
				<Spinner animation="grow" />
			</div>
		</div>
	);
};
const ThumbLoading = () => {
	return <div style={{ height: '45px', width: '45px' }} />;
};

const FamilyLoading = () => {
	return <div style={{ height: '30px', width: '30px' }} />;
};

export default MonsterLoading;
