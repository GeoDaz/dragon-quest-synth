import { makeClassName } from '@/functions';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import { Game } from '@/types/Game';

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
			<Card.Img
				variant="top"
				src={`/images/${game.key}.${game.extension}`}
				alt={game.title}
				title={game.title}
			/>
		</Card>
	);
};

export default GameCard;
