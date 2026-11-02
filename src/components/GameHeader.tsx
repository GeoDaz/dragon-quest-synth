import GameCard from '@/components/GameCard';
import GameTabs from '@/components/GameTabs';
import { games } from '@/functions/games';
import { Game } from '@/types/Game';

const GameHeader = ({
	game,
	active,
	hasTalents,
	hasAreas,
	cardHref,
}: {
	game: Game;
	active: string;
	hasTalents: boolean;
	hasAreas: boolean;
	cardHref: (game: Game) => string | undefined;
}) => (
	<>
		<div className="row mb-4">
			{Object.values(games)
				.filter(_game => _game.available)
				.map((_game: Game) => (
					<div
						key={_game.key}
						className="game-card-col col-4 col-sm-3 d-flex mb-2 mb-md-3 mb-lg-4"
					>
						<GameCard game={_game} currentGame={game.key} href={cardHref(_game)} />
					</div>
				))}
		</div>
		<GameTabs
			game={game.key}
			active={active}
			hasTalents={hasTalents}
			hasAreas={hasAreas}
		/>
	</>
);

export default GameHeader;
