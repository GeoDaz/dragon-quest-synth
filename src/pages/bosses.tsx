import React from 'react';
import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';
import Boss from '@/components/Boss';
import useTranslate from '@/hooks/useTranslate';
import { ImagesContext } from '@/context/images';
import { StringObject } from '@/types/Ui';
import { Boss as BossInterface, BossGame } from '@/types/Boss';

interface Props {
	games: BossGame[];
	images: StringObject;
}

const PageBosses: React.FC<Props> = ({ games, images }) => {
	const { isFr, translateUI } = useTranslate();

	return (
		<Layout
			noGoBack
			title={translateUI('Bosses')}
			metatitle="Bosses"
			metadescription="The main bosses of every game in the main Dragon Quest saga, from I to XI."
		>
			<blockquote className="blockquote">
				{isFr ?
					'Les boss majeurs de chaque jeu de la saga principale Dragon Quest, de I à XI.'
				:	'The major bosses of every game in the main Dragon Quest saga, from I to XI.'
				}
			</blockquote>
			<ImagesContext.Provider value={images}>
				{games.map(game => (
					<div key={game.key} className="card mb-4">
						<div className="card-header">
							<h2 className="h5 mb-0">
								<span className="text-primary fw-bold">{game.key}</span>{' '}
								&mdash; {game.title}
							</h2>
							<small className="text-muted">
								{game.subtitle} ({game.year})
							</small>
						</div>
						<div className="card-body">
							<div className="d-flex flex-wrap gap-3">
								{game.bosses.map((boss: BossInterface) => (
									<Boss key={boss.name} boss={boss} />
								))}
							</div>
						</div>
					</div>
				))}
			</ImagesContext.Provider>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	const bosses = require('../json/bosses.json');
	const images = require('../json/monstersImages.json');
	return { props: { games: bosses as BossGame[], images } };
};

export default PageBosses;
