import { GetStaticPaths, GetStaticProps } from 'next';
import { Families } from '@/types/Monster';
import PageLines, {
	gameDetails,
	gameFarewell,
	gameHasTalentRecipes,
	gameItems,
	gameSpawns,
	gameTalents,
	gameTerms,
} from '@/components/SynthesisPage';
import { reverseSynth } from '@/functions/transformer/synthesis';
import { familiesImageNames, pickImages } from '@/functions/images';
import { Game } from '@/types/Game';
import { games } from '@/functions/games';

export const getStaticPaths: GetStaticPaths = async ({ locales = [] }) => {
	const paths = Object.values(games)
		.filter((game: Game) => game.available)
		.flatMap((game: Game) =>
			locales.map(locale => ({ params: { name: game.key }, locale }))
		);
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params?.name) {
		return { notFound: true };
	}
	const gameName = params.name as string;
	const game = games[gameName];
	if (!game || !game.available) {
		return { notFound: true };
	}

	try {
		const families: Families = require(`../../json/${gameName}.json`);
		reverseSynth(families);

		const images = pickImages(
			require('../../json/monstersImages.json'),
			familiesImageNames(families)
		);
		const details = gameDetails(gameName);
		const terms = gameTerms(gameName);
		const farewell = gameFarewell(gameName);
		const items = gameItems(gameName);
		const spawns = gameSpawns(gameName);
		const talents = gameTalents(gameName, details);
		return {
			props: {
				families,
				images,
				details,
				terms,
				farewell,
				items,
				spawns,
				talents,
				game,
				hasTalentRecipes: gameHasTalentRecipes(gameName),
			},
		};
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
