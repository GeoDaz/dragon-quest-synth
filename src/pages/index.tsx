import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { Monster as MonsterInterface } from '@/types/Monster';
import Layout from '@/components/Layout';
import Monster from '@/components/Monster/Monster';
import Family from '@/components/Monster/Family';
import { ImagesContext } from '@/context/images';
import { MonstersContext } from '@/context/monsters';
import { familiesColors } from '@/consts/colors';

interface Props {
	monsters: { [key: string]: MonsterInterface };
	families: { [key: string]: { [key: string]: MonsterInterface[] } };
	images: { [key: string]: string };
}
const PageLines: React.FC<Props> = ({ monsters = {}, families = {}, images = {} }) => {
	const [activeMonster, setActiveMonster] = useState();
	return (
		<Layout
			noGoBack
			title="Synthesis"
			metadescription="The aim of this site is to present dragon quest synthesis from all games."
		>
			<MonstersContext.Provider value={monsters}>
				<ImagesContext.Provider value={images}>
					{Object.keys(families).length > 0 ? (
						<div className="synthesis-list">
							{Object.entries(families).map(([family, ranks]) => (
								<div key={family} className="mb-4">
									<h2
										className="rounded"
										style={{
											backgroundColor: familiesColors[family],
											boxShadow: 'inset 0 0 0 3px #aeac69',
										}}
									>
										<Family name={family} big /> &nbsp; {family}
									</h2>
									{Object.entries(ranks).map(([rank, ranking]) => (
										<div
											key={rank}
											className="flex flex-col gap-1 mb-4 px-3"
										>
											<h3>{rank}</h3>
											<div className="d-flex flex-wrap gap-3">
												{ranking.map(monster => (
													<Monster
														key={monster.name}
														monster={monster}
														activeMonster={activeMonster}
														handleActive={setActiveMonster}
													/>
												))}
											</div>
										</div>
									))}
								</div>
							))}
						</div>
					) : (
						<p>No Synthesis found.</p>
					)}
				</ImagesContext.Provider>
			</MonstersContext.Provider>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const families: {
			[key: string]: { [key: string]: MonsterInterface[] };
		} = require('../json/DQM3-Families.json');

		const monsters: { [key: string]: MonsterInterface } = {};
		Object.values(families).forEach(ranks => {
			Object.values(ranks).forEach(innermonsters => {
				innermonsters.forEach(monster => {
					monsters[monster.name] = monster;
				});
			});
		});

		const images = require('../json/monstersImages.json');
		return { props: { monsters, families, images } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
