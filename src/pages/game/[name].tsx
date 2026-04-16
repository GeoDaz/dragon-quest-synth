import { GetStaticProps } from 'next';
import { Families, Monster as MonsterInterface } from '@/types/Monster';
import PageLines from '..';
import { reverseSynth } from '@/functions/transformer/synthesis';
import { Game } from '@/types/Game';

export const getStaticPaths = async () => {
	const paths: { params: { name: string } }[] = (
		Object.values(require('../../json/games.json')) as Game[]
	)
		.filter((game: Game) => game.available)
		.map((game: Game) => ({
			params: { name: game.key },
		}));
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params?.name) {
		return { notFound: true };
	}
	const gameName = params.name as string;
	const games = require('../../json/games.json');
	const game = games[gameName];
	if (!game || !game.available) {
		return { notFound: true };
	}

	try {
		const families: Families = require(`../../json/${gameName}.json`);
		reverseSynth(families);

		const images = require('../../json/monstersImages.json');
		return { props: { families, images, game } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
