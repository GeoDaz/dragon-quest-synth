import { makeClassName } from '@/functions';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import { Game } from '@/types/Game';
import Image from 'next/image';

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
				as={Image}
				variant="top"
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
		</Card>
	);
};

export default GameCard;
