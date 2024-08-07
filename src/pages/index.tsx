import React, { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { Families, Monster as MonsterInterface } from '@/types/Monster';
import Layout from '@/components/Layout';
import Monster from '@/components/Monster/Monster';
import Family from '@/components/Monster/Family';
import { ImagesContext } from '@/context/images';
import { familiesColors } from '@/consts/colors';
import { families as familyList, ranks as rankList } from '@/consts/data';
import { useRouter } from 'next/router';
import { Dropdown, DropdownButton, FormCheck } from 'react-bootstrap';
import LoadableImage from '@/components/LoadableImage';
import { reverseSynth } from '@/functions/transformer/synthesis';
import { StringObject } from '@/types/Ui';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName, stringToKey } from '@/functions';
import useHash from '@/hooks/useHash';
import useIsVisible from '@/hooks/useIsVisible';
import MonsterLoading from '@/components/Monster/MonsterLoading';
import SearchBar from '@/components/SearchBar';
import Icon from '@/components/Icon';

interface Props {
	families: Families;
	images: StringObject;
	dqm: boolean;
}
const PageLines: React.FC<Props> = props => {
	const { images, dqm } = props;
	const [families, setFamilies] = useState<Families>(props.families);
	const router = useRouter();
	const hash = useHash();
	const { isFr, translateUI } = useTranslate();
	const [search, setSearch] = useState<string>();
	const [selectedFamily, setSelectedFamily] = useState<string | undefined>();
	const [selectedRank, setSelectedRank] = useState<string | undefined>();

	useEffect(() => {
		if (!search) {
			if (families !== props.families) {
				setFamilies(props.families);
			}
		} else {
			setFamilies(
				Object.entries(props.families).reduce((acc, [family, ranks]) => {
					// if (stringToKey(translateUI(family)).includes(search)) {
					// 	acc[family] = ranks;
					// 	return acc;
					// }

					const nextRanks = Object.entries(ranks).reduce(
						(acc, [rank, monsters]) => {
							const nextMonsters = monsters.filter(monster =>
								stringToKey(
									(isFr && monster.nom) || monster.name
								).includes(search)
							);
							if (nextMonsters.length > 0) {
								acc[rank] = nextMonsters;
							}
							return acc;
						},
						{} as { [key: string]: MonsterInterface[] }
					);
					if (Object.keys(nextRanks).length > 0) {
						acc[family] = nextRanks;
					}
					return acc;
				}, {} as Families)
			);
		}
	}, [search]);

	const handleSearch = (value: string) => {
		let sanitizedSearch = stringToKey(value);
		if (sanitizedSearch == search) return;
		if (sanitizedSearch.length < 3) {
			sanitizedSearch = '';
		}
		setSearch(sanitizedSearch);
	};

	return (
		<Layout
			noGoBack
			title={translateUI('Synthesis')}
			metadescription="The aim of this site is to present dragon quest synthesis from all games."
			className="overflow-visible"
		>
			<div className="d-flex align-items-center mb-4 pb-2">
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
			<div className="d-flex flex-wrap gap-4 mb-4">
				<SearchBar
					label={isFr ? 'Rechercher un monstre' : 'Research a monster'}
					onSubmit={handleSearch}
					defaultValue={search}
				/>
				<DropdownButton id="family-selector" title={translateUI('Family')}>
					{!!selectedFamily && (
						<Dropdown.Item onClick={() => setSelectedFamily(undefined)}>
							<Icon name="x" /> {translateUI('Void')}
						</Dropdown.Item>
					)}
					{familyList.map(family => (
						<Dropdown.Item
							key={family}
							active={selectedFamily == family}
							onClick={() => setSelectedFamily(family)}
						>
							{translateUI(family)}
						</Dropdown.Item>
					))}
				</DropdownButton>
				<DropdownButton id="rank-selector" title={translateUI('Rank')}>
					{!!selectedRank && (
						<Dropdown.Item onClick={() => setSelectedRank(undefined)}>
							<Icon name="x" /> {translateUI('Void')}
						</Dropdown.Item>
					)}
					{rankList.map(rank => (
						<Dropdown.Item
							key={rank}
							active={selectedRank == rank}
							onClick={() => setSelectedRank(rank)}
						>
							{rank}
						</Dropdown.Item>
					))}
				</DropdownButton>
			</div>
			<ImagesContext.Provider value={images}>
				{Object.keys(families).length > 0 ? (
					<div className="synthesis-list">
						{Object.entries(families).map(([family, ranks]) => (
							<FamilySection
								key={family}
								family={family}
								ranks={ranks}
								hash={hash}
								selectedFamily={selectedFamily}
								selectedRank={selectedRank}
							/>
						))}
					</div>
				) : (
					<p>{isFr ? 'Aucune synthèse trouvée' : 'No synthesis found'}.</p>
				)}
			</ImagesContext.Provider>
		</Layout>
	);
};

const FamilySection = ({
	family,
	hash,
	ranks,
	selectedFamily,
	selectedRank,
}: {
	family: string;
	hash?: string;
	ranks: { [key: string]: MonsterInterface[] };
	selectedFamily?: string;
	selectedRank?: string;
}) => {
	const { translateUI } = useTranslate();

	if (selectedFamily && selectedFamily != family) return null;
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
			{Object.entries(ranks).map(([rank, ranking]) =>
				selectedRank && selectedRank != rank ? null : (
					<RankSection
						key={rank}
						family={family}
						rank={rank}
						ranking={ranking}
						hash={hash}
					/>
				)
			)}
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
		reverseSynth(families);

		const images = require('../json/monstersImages.json');
		return { props: { families, images, dqm: true } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
