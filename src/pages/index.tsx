import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { Monster as MonsterInterface } from '@/types/Monster';
import Layout from '@/components/Layout';
import Monster from '@/components/Monster/Monster';
import Family from '@/components/Monster/Family';
import { ImagesContext } from '@/context/images';
import { MonstersContext } from '@/context/monsters';

interface Props {
	monsters: { [key: string]: MonsterInterface };
	families: { [key: string]: { [key: string]: string[] } };
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
									<h2>
										<Family name={family} big /> &nbsp; {family}
									</h2>
									{Object.entries(ranks).map(([rank, ranking]) => (
										<div
											key={rank}
											className="flex flex-col gap-1 mb-4 px-3"
										>
											<h3>{rank}</h3>
											<div className="d-flex flex-wrap gap-3">
												{ranking.map(name => (
													<Monster
														key={name}
														name={name}
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
		const families = require('../json/DQM3-Families.json');
		const monsters = require('../json/DQM3-Monsters.json');
		const images = require('../json/monstersImages.json');
		return { props: { monsters, families, images } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
