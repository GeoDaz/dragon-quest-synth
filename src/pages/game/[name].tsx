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
	paths.push({
		params: { name: 'Custom' },
	});
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params?.name) {
		return { notFound: true };
	}
	const game = params.name as string;
	const games = require('../../json/games.json');
	if ((!games[game] || !games[game].available) && game !== 'Custom') {
		return { notFound: true };
	}

	try {
		const families: Families = require(`../../json/${game}.json`);
		reverseSynth(families);

		const images = require('../../json/monstersImages.json');
		return { props: { families, images, game } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
