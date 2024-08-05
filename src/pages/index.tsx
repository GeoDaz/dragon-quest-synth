import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { Families, Monster as MonsterInterface, Monsters } from '@/types/Monster';
import Layout from '@/components/Layout';
import Monster from '@/components/Monster/Monster';
import Family from '@/components/Monster/Family';
import { ImagesContext } from '@/context/images';
import { MonstersContext } from '@/context/monsters';
import { familiesColors } from '@/consts/colors';
import { useRouter } from 'next/router';
import { Card, FormCheck } from 'react-bootstrap';
import LoadableImage from '@/components/LoadableImage';
import { makeMonsters, reverseSynth } from '@/functions/transformer/synthesis';
import { StringObject } from '@/types/Ui';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName } from '@/functions';
import useHash from '@/hooks/useHash';
import useIsVisible from '@/hooks/useIsVisible';
import MonsterLoading from '@/components/Monster/MonsterLoading';

interface Props {
	monsters: Monsters;
	families: Families;
	images: StringObject;
	dqm: boolean;
}
const PageLines: React.FC<Props> = ({
	monsters = {},
	families = {},
	images = {},
	dqm = true,
}) => {
	const router = useRouter();
	const { isFr, translateUI } = useTranslate();
	const hash = useHash();

	return (
		<Layout
			noGoBack
			title={translateUI('Synthesis')}
			metadescription="The aim of this site is to present dragon quest synthesis from all games."
		>
			<div className="mb-5 d-flex align-items-center">
				<LoadableImage
					height={125}
					width={270}
					src="/images/dqmtdp.webp"
					alt="Dragon Quest Monster : The Dark Prince"
					className="img-fluid"
				/>
				<FormCheck
					type="switch"
					id="dqmtdp-switch"
					checked={dqm}
					readOnly
					onClick={e => router.push(dqm ? '/community' : '/')}
					className="h2 click"
				/>
			</div>
			<MonstersContext.Provider value={monsters}>
				<ImagesContext.Provider value={images}>
					{Object.keys(families).length > 0 ? (
						<div className="synthesis-list">
							{Object.entries(families).map(([family, ranks]) => (
								<FamilySection
									key={family}
									family={family}
									ranks={ranks}
									hash={hash}
								/>
							))}
						</div>
					) : (
						<p>{isFr ? 'Aucune synthèse trouvée' : 'No synthesis found'}.</p>
					)}
				</ImagesContext.Provider>
			</MonstersContext.Provider>
		</Layout>
	);
};

const FamilySection = ({
	family,
	hash,
	ranks,
}: {
	family: string;
	hash?: string;
	ranks: { [key: string]: MonsterInterface[] };
}) => {
	const { translateUI } = useTranslate();
	return (
		<div key={family} className="mb-4">
			<h2
				className={makeClassName(
					'family-title',
					hash == family && 'active-outline'
				)}
				style={{
					backgroundColor: familiesColors[family],
					// boxShadow: 'inset 0 0 0 3px #aeac69',
				}}
				id={family}
			>
				<Family name={family} big /> &nbsp; {translateUI(family)}
			</h2>
			{Object.entries(ranks).map(([rank, ranking]) => (
				<RankSection
					key={rank}
					family={family}
					rank={rank}
					ranking={ranking}
					hash={hash}
				/>
			))}
		</div>
	);
};

const RankSection = ({
	family,
	rank,
	ranking,
	hash,
}: {
	family: string;
	rank: string;
	ranking: MonsterInterface[];
	hash?: string;
}) => {
	const [ref, visible] = useIsVisible();
	return (
		<div key={rank} ref={ref as any} className="flex flex-col gap-1 mb-4 px-3">
			<h3 id={`${family}-${rank}`}>{rank}</h3>
			<div className="d-flex flex-wrap gap-3">
				{ranking.map(monster =>
					visible ? (
						<Monster key={monster.name} monster={monster} hash={hash} />
					) : (
						<MonsterLoading
							key={monster.name}
							monster={monster}
							hash={hash}
						/>
					)
				)}
			</div>
		</div>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const families: Families = require('../json/DQM3-Families.json');

		const monsters = makeMonsters(families);
		reverseSynth(monsters);

		const images = require('../json/monstersImages.json');
		return { props: { monsters, families, images, dqm: true } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
