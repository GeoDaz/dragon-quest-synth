import { GetStaticProps } from 'next';
import { Families, Monster as MonsterInterface } from '@/types/Monster';
import PageLines from '.';
import { makeMonsters, reverseSynth } from '@/functions/transformer/synthesis';

export const getStaticProps: GetStaticProps = async () => {
	try {
		const families: Families = require('../json/Families.json');

		const monsters = makeMonsters(families);
		reverseSynth(monsters);

		const images = require('../json/monstersImages.json');
		return { props: { monsters, families, images, dqm: false } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
