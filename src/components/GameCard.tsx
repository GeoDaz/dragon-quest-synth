import { makeClassName } from '@/functions';
import { Game } from '@/types/Game';
import Image from 'next/image';
import Link from './Link';
import Icon from './Icon';

const GameCard = ({
	game,
	currentGame,
	href = `/game/${game.key}`,
}: {
	game: Game;
	currentGame?: string;
	href?: string;
}) => (
	<Link
		href={href}
		aria-current={game.key == currentGame ? 'page' : undefined}
		className={makeClassName(
			'card click flex-grow-1 flex-center overflow-hidden text-decoration-none',
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
		:	<h2 className="text-primary text-center fw-bold mb-0 p-4">
				<Icon
					name="discord"
					className="display-4"
					style={{ verticalAlign: 'sub' }}
				/>{' '}
				{game.title}
			</h2>
		}
	</Link>
);

export default GameCard;
