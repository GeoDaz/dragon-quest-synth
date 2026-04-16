import { makeClassName } from '@/functions';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import { Game } from '@/types/Game';
import Image from 'next/image';
import Icon from './Icon';

const GameCard = ({ game, currentGame }: { game: Game; currentGame?: string }) => {
	const router = useRouter();
	return (
		<Card
			onClick={() => router.push(`/game/${game.key}`)}
			className={makeClassName(
				'click flex-grow-1 flex-center',
				!game || game.key == currentGame ? 'active' : ''
			)}
		>
			{game.extension ?
				<Image
					className="card-img-top"
					src={`/images/${game.key}.${game.extension}`}
					alt={game.title}
					title={game.title}
					width={0}
					height={0}
					style={{
						width: 'auto',
						height: 'auto',
						maxWidth: '100%',
						maxHeight: '100%',
					}}
				/>
			:	<h2 className="text-primary text-center fs-1 fw-bold mb-0 p-4">
					<Icon
						name="discord"
						className="display-4"
						style={{ verticalAlign: 'sub' }}
					/>{' '}
					{game.title}
				</h2>
			}
		</Card>
	);
};

export default GameCard;
