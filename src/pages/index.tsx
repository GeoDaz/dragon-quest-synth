import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { GetStaticProps } from 'next';
import { Families, Monster as MonsterInterface } from '@/types/Monster';
import Layout from '@/components/Layout';
import Monster from '@/components/Monster/Monster';
import Family from '@/components/Monster/Family';
import { ImagesContext } from '@/context/images';
import { familiesColors } from '@/consts/colors';
import { families as familyList } from '@/consts/data';
import { Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import { reverseSynth } from '@/functions/transformer/synthesis';
import { StringObject } from '@/types/Ui';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName, stringToKey } from '@/functions';
import useHash from '@/hooks/useHash';
import useIsVisible from '@/hooks/useIsVisible';
import MonsterLoading from '@/components/Monster/MonsterLoading';
import SearchBar from '@/components/SearchBar';
import Icon from '@/components/Icon';
import { FiltersContext } from '@/context/filter';
import ScrollUp from '@/components/ScrollUp';
import GameCard from '@/components/GameCard';
import { Game } from '@/types/Game';
import games from '@/json/games.json';

// A game can hold >800 monsters, each mounting many synthesis/reverse-synthesis
// thumbnails. Mount only a batch of monster cards and grow it on scroll.
const PAGE_SIZE = 40;

interface Props {
	families: Families;
	images: StringObject;
	game: Game;
}
const PageLines: React.FC<Props> = props => {
	const { images, game } = props;
	const [families, setFamilies] = useState<Families>(props.families);
	const hash = useHash();
	const { isFr, translateUI } = useTranslate();
	const [search, setSearch] = useState<string>();
	const [selectedFamily, setSelectedFamily] = useState<string | undefined>();
	const [selectedRank, setSelectedRank] = useState<string | undefined>();
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	// Flat, ordered view of the current families after family/rank filters, plus
	// index maps used for pagination and hash deep-links. (search is already
	// applied to the `families` state above.)
	const filtered = useMemo(() => {
		const entries: {
			family: string;
			rank: string;
			monsters: MonsterInterface[];
		}[] = [];
		const monsterIndex: { [name: string]: number } = {};
		const familyStart: { [family: string]: number } = {};
		const rankStart: { [id: string]: number } = {};
		let count = 0;
		for (const [family, ranks] of Object.entries(families)) {
			if (selectedFamily && selectedFamily !== family) continue;
			if (familyStart[family] === undefined) familyStart[family] = count;
			for (const [rank, monsters] of Object.entries(ranks)) {
				if (selectedRank && selectedRank !== rank) continue;
				rankStart[`${family}-${rank}`] = count;
				entries.push({ family, rank, monsters });
				monsters.forEach(m => {
					monsterIndex[m.name] = count;
					count++;
				});
			}
		}
		return { entries, total: count, monsterIndex, familyStart, rankStart };
	}, [families, selectedFamily, selectedRank]);

	// Nested (Families-shaped) subset limited to the first `visibleCount` monsters.
	const paginatedFamilies = useMemo(() => {
		const result: Families = {};
		let shown = 0;
		for (const { family, rank, monsters } of filtered.entries) {
			if (shown >= visibleCount) break;
			const slice = monsters.slice(0, visibleCount - shown);
			shown += slice.length;
			if (!result[family]) result[family] = {};
			result[family][rank] = slice;
		}
		return result;
	}, [filtered, visibleCount]);

	// Reset pagination whenever the visible set changes.
	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [search, selectedFamily, selectedRank]);

	// Grow the batch as the bottom sentinel approaches the viewport.
	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			es => {
				if (es[0].isIntersecting) {
					setVisibleCount(v => Math.min(v + PAGE_SIZE, filtered.total));
				}
			},
			{ rootMargin: '600px' }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [filtered.total, visibleCount]);

	// Deep-link via hash (family / rank / monster): mount the target before scroll.
	useEffect(() => {
		if (!hash || filtered.total === 0) return;
		const idx =
			filtered.monsterIndex[hash] ??
			filtered.rankStart[hash] ??
			filtered.familyStart[hash];
		if (idx !== undefined && idx >= visibleCount) {
			setVisibleCount(Math.min(idx + PAGE_SIZE, filtered.total));
			return; // re-runs once visibleCount grows, then scrolls
		}
		document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
	}, [hash, filtered, visibleCount]);

	useEffect(() => {
		if (!search) {
			if (families !== props.families) {
				setFamilies(props.families);
			}
		} else {
			setFamilies(
				Object.entries(props.families).reduce((acc, [family, ranks]) => {
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
	}, [search, props.families]);

	const resetFilters = useCallback(() => {
		setSelectedFamily(undefined);
		setSelectedRank(undefined);
		setSearch(undefined);
	}, []);

	const filters = useMemo(
		() => ({ resetFilters, search, selectedFamily, selectedRank }),
		[resetFilters, search, selectedFamily, selectedRank]
	);

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
			<ScrollUp />
			<div className="row mb-4">
				{Object.values(games)
					.filter(game => game.available)
					.map((_game: Game) => (
						<div
							key={_game.key}
							className="col-6 col-lg-2 col-md-3 col-sm-4 d-flex mb-4"
						>
							<GameCard game={_game} currentGame={game.key} />
						</div>
					))}
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
					{game.ranks.map(rank => (
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
			<FiltersContext.Provider value={filters}>
				<ImagesContext.Provider value={images}>
					{filtered.total > 0 ?
						<>
							<div className="synthesis-list">
								{Object.entries(paginatedFamilies).map(
									([family, ranks]) => (
										<FamilySection
											key={family}
											family={family}
											ranks={ranks}
											hash={hash}
										/>
									)
								)}
							</div>
							{visibleCount < filtered.total && (
								<div ref={sentinelRef} className="text-center py-4">
									<Spinner animation="border" />
								</div>
							)}
						</>
					:	<p>{isFr ? 'Aucune synthèse trouvée' : 'No synthesis found'}.</p>}
				</ImagesContext.Provider>
			</FiltersContext.Provider>
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
	const { selectedFamily, selectedRank } = useContext(FiltersContext);

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
			{/* selectedRank is used here to avoid calling useIsVisible */}
			{Object.entries(ranks).map(([rank, ranking]) =>
				selectedRank && selectedRank != rank ?
					null
				:	<RankSection
						key={rank}
						family={family}
						rank={rank}
						ranking={ranking}
						hash={hash}
					/>
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

	const hashId = `${family}-${rank}`;
	return (
		<div key={rank} ref={ref as any} className="flex flex-col gap-1 mb-4 px-3">
			<h3 id={hashId}>
				<span
					className={makeClassName(
						'rank-title',
						hash == hashId && 'active-outline'
					)}
				>
					{rank}
				</span>
			</h3>
			<div className="d-flex flex-wrap gap-3">
				{ranking.map(monster =>
					visible ?
						<Monster key={monster.name} monster={monster} hash={hash} />
					:	<MonsterLoading key={monster.name} monster={monster} hash={hash} />
				)}
			</div>
		</div>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const defaultGame = 'DQM3';
		const families: Families = require(`../json/${defaultGame}.json`);
		reverseSynth(families);
		const games = require('../json/games.json');
		const game = games[defaultGame];

		const images = require('../json/monstersImages.json');
		return { props: { families, images, game } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
