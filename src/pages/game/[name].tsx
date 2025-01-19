import { GetStaticProps } from 'next';
import { Families, Monster as MonsterInterface } from '@/types/Monster';
import PageLines from '..';
import { reverseSynth } from '@/functions/transformer/synthesis';

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params || !params.name) {
		return { notFound: true };
	}
	const game = require('../../json/games.json');
	if (!game.includes(params.name)) {
		return { notFound: true };
	}

	try {
		const families: Families = require(`../../json/${params.name}.json`);
		reverseSynth(families);

		const images = require('../json/monstersImages.json');
		return { props: { families, images, game: params.name } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
