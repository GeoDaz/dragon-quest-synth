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
			style={{ height: `${416 / 15}rem`, width: '18rem' }}
		>
			<CardHeader>
				<div className="text-center">
					<div className="d-inline-block position-relative line-point pictured">
						<div className="line-point-safe-zone">
							<div className="spinner-wrapper">
								<Spinner animation="grow" />
							</div>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardBody className="d-flex justify-content-center align-items-center">
				<span className="sr-only">{monster.name}</span>
				<Spinner animation="grow" />
			</CardBody>
		</Card>
	);
};

export default MonsterLoading;
