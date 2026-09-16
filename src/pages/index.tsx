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
import MonsterRow from '@/components/Monster/MonsterRow';
import Family from '@/components/Monster/Family';
import { ImagesContext } from '@/context/images';
import {
	DetailsContext,
	emptyFarewell,
	emptyItems,
	emptyTerms,
} from '@/context/details';
import { familiesColors, familiesGradients } from '@/consts/colors';
import { families as familyList } from '@/consts/data';
import { Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import { indexMonsters, reverseSynth } from '@/functions/transformer/synthesis';
import { StringObject } from '@/types/Ui';
import {
	GameFarewell,
	GameItems,
	GameTerms,
	MonstersDetails,
} from '@/types/MonsterDetails';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName, stringToKey } from '@/functions';
import useHash from '@/hooks/useHash';
import useScrollToAnchor from '@/hooks/useScrollToAnchor';
import useIsVisible from '@/hooks/useIsVisible';
import MonsterRowLoading from '@/components/Monster/MonsterRowLoading';
import SearchBar from '@/components/SearchBar';
import Icon from '@/components/Icon';
import { FiltersContext } from '@/context/filter';
import { TrailContext } from '@/context/trail';
import SynthesisTrail from '@/components/Monster/SynthesisTrail';
import useSynthesisTrail from '@/hooks/useSynthesisTrail';
import ScrollUp from '@/components/ScrollUp';
import GameCard from '@/components/GameCard';
import { Game } from '@/types/Game';
import games from '@/json/games.json';
import Rank from '@/components/Monster/Rank';

// A game can hold >800 monsters, each mounting many synthesis/reverse-synthesis
// thumbnails. Mount only a batch of monster cards and grow it on scroll.
const PAGE_SIZE = 40;

interface Props {
	families: Families;
	images: StringObject;
	details: MonstersDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
	game: Game;
}
export const gameDetails = (game: string): MonstersDetails => {
	try {
		return require(`../json/${game}Details.json`);
	} catch (e) {
		return {};
	}
};

export const gameTerms = (game: string): GameTerms => {
	try {
		return require(`../json/${game}Terms.json`);
	} catch (e) {
		return { traits: {}, skills: {} };
	}
};

export const gameFarewell = (game: string): GameFarewell => {
	try {
		return require(`../json/${game}Farewell.json`);
	} catch (e) {
		return { items: [], amounts: [] };
	}
};

export const gameItems = (game: string): GameItems => {
	try {
		return require(`../json/${game}Items.json`);
	} catch (e) {
		return {};
	}
};

const PageLines: React.FC<Props> = props => {
	const {
		images,
		game,
		details = {},
		terms = emptyTerms,
		farewell = emptyFarewell,
		items = emptyItems,
	} = props;
	const [families, setFamilies] = useState<Families>(props.families);
	const { hash, nav } = useHash();
	const scrollToAnchor = useScrollToAnchor();
	const { isFr, translateUI } = useTranslate();
	const [search, setSearch] = useState<string>();
	const [selectedFamily, setSelectedFamily] = useState<string | undefined>();
	const [selectedRank, setSelectedRank] = useState<string | undefined>();
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const allMonsters = useMemo(() => indexMonsters(props.families), [props.families]);
	const { trees, preferred, walk, pickInTrail, clearTrail } =
		useSynthesisTrail(allMonsters);
	const detailsValue = useMemo(
		() => ({ details, terms, farewell, items }),
		[details, terms, farewell, items]
	);

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
		const familyTotals: { [family: string]: number } = {};
		const rankStart: { [id: string]: number } = {};
		let count = 0;
		for (const [family, ranks] of Object.entries(families)) {
			if (selectedFamily && selectedFamily !== family) continue;
			if (familyStart[family] === undefined) familyStart[family] = count;
			for (const [rank, monsters] of Object.entries(ranks)) {
				if (selectedRank && selectedRank !== rank) continue;
				rankStart[`${family}-${rank}`] = count;
				entries.push({ family, rank, monsters });
				familyTotals[family] = (familyTotals[family] || 0) + monsters.length;
				monsters.forEach(m => {
					monsterIndex[m.name] = count;
					count++;
				});
			}
		}
		return {
			entries,
			total: count,
			monsterIndex,
			familyStart,
			familyTotals,
			rankStart,
		};
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

	const scrolledNavRef = useRef<number>();
	useEffect(() => {
		if (!hash || filtered.total === 0 || scrolledNavRef.current === nav) return;
		const idx =
			filtered.monsterIndex[hash] ??
			filtered.rankStart[hash] ??
			filtered.familyStart[hash];
		if (idx !== undefined && idx >= visibleCount) {
			setVisibleCount(Math.min(idx + PAGE_SIZE, filtered.total));
			return;
		}
		const firstHashOfSession = scrolledNavRef.current === undefined;
		if (scrollToAnchor(hash, firstHashOfSession ? 'auto' : 'smooth')) {
			scrolledNavRef.current = nav;
		}
	}, [hash, nav, filtered, visibleCount]);

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
							className="game-card-col col-4 col-sm-3 d-flex mb-2 mb-md-3 mb-lg-4"
						>
							<GameCard game={_game} currentGame={game.key} />
						</div>
					))}
			</div>
			<div className="synthesis-filters mb-4">
				<SearchBar
					label={translateUI('Research a monster')}
					onSubmit={handleSearch}
					defaultValue={search}
				/>
				<DropdownButton
					id="family-selector"
					className={makeClassName(
						'filter-dropdown',
						!!selectedFamily && 'filter-active'
					)}
					title={
						selectedFamily ?
							translateUI(selectedFamily)
						:	translateUI('Family')
					}
				>
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
				<DropdownButton
					id="rank-selector"
					className={makeClassName(
						'filter-dropdown',
						!!selectedRank && 'filter-active'
					)}
					title={
						selectedRank ?
							`${translateUI('Rank')} ${selectedRank}`
						:	translateUI('Rank')
					}
				>
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
				{(!!search || !!selectedFamily || !!selectedRank) && (
					<button type="button" className="filter-reset" onClick={resetFilters}>
						<Icon name="x" /> {translateUI('Clear filters')}
					</button>
				)}
				<span className="filter-count">
					{filtered.total}&nbsp;
					{translateUI(filtered.total > 1 ? 'monsters' : 'monster')}
				</span>
			</div>
			<FiltersContext.Provider value={filters}>
				<ImagesContext.Provider value={images}>
					<DetailsContext.Provider value={detailsValue}>
						<TrailContext.Provider value={walk}>
							{filtered.total > 0 ?
								<>
									<div className="synthesis-list">
										{Object.entries(paginatedFamilies).map(
											([family, ranks]) => (
												<FamilySection
													key={family}
													family={family}
													ranks={ranks}
													count={filtered.familyTotals[family]}
													hash={hash}
												/>
											)
										)}
									</div>
									{visibleCount < filtered.total && (
										<div
											ref={sentinelRef}
											className="text-center py-4"
										>
											<Spinner animation="border" />
										</div>
									)}
								</>
							:	<p>{translateUI('No synthesis found')}.</p>}
							<SynthesisTrail
								trees={trees}
								preferred={preferred}
								onPick={pickInTrail}
								onClear={clearTrail}
							/>
						</TrailContext.Provider>
					</DetailsContext.Provider>
				</ImagesContext.Provider>
			</FiltersContext.Provider>
		</Layout>
	);
};

const FamilySection = ({
	family,
	hash,
	ranks,
	count,
}: {
	family: string;
	hash?: string;
	ranks: { [key: string]: MonsterInterface[] };
	count: number;
}) => {
	const { translateUI } = useTranslate();
	const { selectedFamily, selectedRank } = useContext(FiltersContext);

	if (selectedFamily && selectedFamily != family) return null;
	return (
		<section className="family-section">
			<h2
				className={makeClassName(
					'family-title',
					hash == family && 'active-outline'
				)}
				style={
					{
						'--dl-family-color': familiesColors[family],
						'--dl-family-top': familiesGradients[family]?.[0],
						'--dl-family-bottom': familiesGradients[family]?.[1],
					} as React.CSSProperties
				}
				id={family}
			>
				<Family name={family} big />
				<span className="family-name">{translateUI(family)}</span>
				<span className="family-count">
					{count}&nbsp;{translateUI(count > 1 ? 'monsters' : 'monster')}
				</span>
			</h2>
			<div className="table-responsive">
				<table className="table synthesis-table">
					<thead>
						<tr>
							<th className="cell-monster">{translateUI('Monster')}</th>
							<th className="cell-details" />
							<th className="cell-family">{translateUI('Family')}</th>
							<th className="cell-rank">{translateUI('Rank')}</th>
							<th className="cell-synthesis">{translateUI('Synthesis')}</th>
							<th className="cell-rev-synthesis">
								{translateUI('Synthesize into')}
							</th>
						</tr>
					</thead>
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
				</table>
			</div>
		</section>
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

	const { translateUI } = useTranslate();
	const hashId = `${family}-${rank}`;
	return (
		<tbody ref={ref as any} className="rank-group">
			<tr>
				<th colSpan={6} className="group-cell pe-0">
					<h3 id={hashId} className="rank-heading">
						<span
							className={makeClassName(
								'rank-title',
								hash == hashId && 'active-outline'
							)}
						>
							{translateUI('Rank')} <Rank name={rank} big />
						</span>
						<span className="rank-rule" />
					</h3>
				</th>
			</tr>
			{ranking.map(monster =>
				visible ?
					<MonsterRow key={monster.name} monster={monster} hash={hash} />
				:	<MonsterRowLoading key={monster.name} monster={monster} hash={hash} />
			)}
		</tbody>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const defaultGame = 'DQM4';
		const families: Families = require(`../json/${defaultGame}.json`);
		reverseSynth(families);
		const games = require('../json/games.json');
		const game = games[defaultGame];

		const images = require('../json/monstersImages.json');
		const details = gameDetails(defaultGame);
		const terms = gameTerms(defaultGame);
		const farewell = gameFarewell(defaultGame);
		const items = gameItems(defaultGame);
		return { props: { families, images, details, terms, farewell, items, game } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
