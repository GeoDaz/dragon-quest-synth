import { GetStaticProps } from 'next';
import { Monster as MonsterInterface } from '@/types/Monster';
import PageLines from '.';

export const getStaticProps: GetStaticProps = async () => {
	try {
		const families: {
			[key: string]: { [key: string]: MonsterInterface[] };
		} = require('../json/Families.json');

		const monsters: { [key: string]: MonsterInterface } = {};
		Object.values(families).forEach(ranks => {
			Object.values(ranks).forEach(innermonsters => {
				innermonsters.forEach(monster => {
					monsters[monster.name] = monster;
				});
			});
		});

		const images = require('../json/monstersImages.json');
		return { props: { monsters, families, images, dqm: false } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
