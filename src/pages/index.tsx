import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { GetStaticProps } from 'next';
import { Families, Monsters } from '@/types/Families';
import Monster from '@/components/Monster/Monster';
import Family from '@/components/Monster/Family';

interface Props {
	monsters: Monsters;
	families: Families;
}
const PageLines: React.FC<Props> = ({ monsters = {}, families = {} }) => {
	const [activeMonster, setActiveMonster] = useState();
	return (
		<Layout
			noGoBack
			title="Synthesis"
			metadescription="The aim of this site is to present dragon quest synthesis from all games."
		>
			{Object.keys(families).length > 0 ? (
				<div>
					{Object.entries(families).map(([family, ranks]) => (
						<div key={family} className="mb-4">
							<h2>
								<Family name={family} big /> &nbsp; {family}
							</h2>
							{Object.entries(ranks).map(([rank, ranking]) => (
								<div key={rank} className="flex flex-col gap-1 mb-4 px-3">
									<h3>{rank}</h3>
									<div className="d-flex flex-wrap gap-3">
										{ranking.map(name => (
											<Monster
												key={name}
												monster={monsters[name]}
												monsters={monsters}
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
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		let families = require('../json/DQM3-Families.json');
		let monsters = require('../json/DQM3-Monsters.json');
		return { props: { monsters, families } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
