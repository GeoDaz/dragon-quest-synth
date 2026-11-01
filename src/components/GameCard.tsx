import { makeClassName } from '@/functions';
import { Game } from '@/types/Game';
import Image from 'next/image';
import Link from './Link';
import Icon from './Icon';
import useTranslate from '@/hooks/useTranslate';

const GameCard = ({
	game,
	currentGame,
	href = `/game/${game.key}`,
	caption = false,
}: {
	game: Game;
	currentGame?: string;
	href?: string;
	caption?: boolean;
}) => {
	const { translateGame } = useTranslate();
	const title = translateGame(game);
	return (
		<Link
			href={href}
			aria-current={game.key == currentGame ? 'page' : undefined}
			className={makeClassName(
				'card click flex-grow-1 flex-center overflow-hidden text-decoration-none',
				!game || game.key == currentGame ? 'active' : ''
			)}
		>
			<div className="flex-grow-1 d-flex justify-content-center align-items-center">
				{game.extension ?
					<Image
						className="card-img-top"
						src={`/images/${game.key}.${game.extension}`}
						alt={title}
						title={title}
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
						{title}
					</h2>
				}
			</div>
			{caption && !!game.extension && (
				<span className="game-card-caption d-none d-sm-block">{title}</span>
			)}
		</Link>
	);
};

export default GameCard;
