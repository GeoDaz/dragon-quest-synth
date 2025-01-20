import { GetStaticProps } from 'next';
import { Families, Monster as MonsterInterface } from '@/types/Monster';
import PageLines from '..';
import { reverseSynth } from '@/functions/transformer/synthesis';

export const getStaticPaths = async () => {
	const paths = Object.keys(require('../../json/games.json')).map((game: string) => ({
		params: { name: game },
	}));
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params?.name) {
		return { notFound: true };
	}
	const game = params.name as string;
	const games = Object.keys(require('../../json/games.json')) as string[];
	if (!games.includes(game)) {
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
