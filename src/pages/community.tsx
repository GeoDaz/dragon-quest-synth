import { GetStaticProps } from 'next';
import { Families, Monster as MonsterInterface } from '@/types/Monster';
import PageLines from '.';
import { reverseSynth } from '@/functions/transformer/synthesis';

export const getStaticProps: GetStaticProps = async () => {
	try {
		const families: Families = require('../json/Families.json');
		reverseSynth(families);

		const images = require('../json/monstersImages.json');
		return { props: { families, images, dqm: false } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
