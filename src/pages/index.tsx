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
	emptySpawns,
	emptyTalents,
	emptyTerms,
} from '@/context/details';
import { familiesColors, familiesGradients } from '@/consts/colors';
import { families as familyList } from '@/consts/data';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { indexMonsters, reverseSynth } from '@/functions/transformer/synthesis';
import { StringObject } from '@/types/Ui';
import {
	GameFarewell,
	GameItems,
	GameSpawns,
	GameTalents,
	GameTerms,
	MonstersDetails,
	TalentStep,
} from '@/types/MonsterDetails';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName, stringToKey } from '@/functions';
import { familiesImageNames, pickImages } from '@/functions/images';
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
import { ReserveContext } from '@/context/reserve';
import ReserveSidebar from '@/components/Monster/ReserveSidebar';
import useReserve from '@/hooks/useReserve';
import ScrollUp from '@/components/ScrollUp';
import GameCard from '@/components/GameCard';
import { Game } from '@/types/Game';
import games from '@/json/games.json';
import Rank from '@/components/Monster/Rank';
import useFamilyAccordion from '@/hooks/useFamilyAccordion';
import useStickyBar from '@/hooks/useStickyBar';

interface Props {
	families: Families;
	images: StringObject;
	details: MonstersDetails;
	terms: GameTerms;
	farewell: GameFarewell;
	items: GameItems;
	spawns: GameSpawns;
	talents: GameTalents;
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

export const gameSpawns = (game: string): GameSpawns => {
	try {
		return require(`../json/${game}Spawns.json`);
	} catch (e) {
		return {};
	}
};

export const gameTalents = (game: string, details: MonstersDetails): GameTalents => {
	try {
		const data = require(`../json/${game}Moves.json`);
		const used = new Set<string>();
		Object.values(details).forEach(monster => {
			if (monster.skill) used.add(monster.skill);
			monster.randomSkills?.forEach(skill => used.add(skill));
		});
		const talents: GameTalents['talents'] = {};
		const moves: GameTalents['moves'] = {};
		used.forEach(name => {
			const talent = data.talents?.[name];
			if (!talent?.moves?.length) return;
			talents[name] = {
				moves: talent.moves.map(({ move, sp }: TalentStep) => ({ move, sp })),
				...(talent.traits?.length ? { traits: talent.traits } : {}),
			};
			talent.moves.forEach(({ move }: TalentStep) => {
				const entry = data.moves?.[move];
				if (entry?.en) moves[move] = { en: entry.en };
			});
		});
		return { talents, moves };
	} catch (e) {
		return emptyTalents;
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
		spawns = emptySpawns,
		talents = emptyTalents,
	} = props;
	const [families, setFamilies] = useState<Families>(props.families);
	const { hash, nav, navigate } = useHash();
	const scrollToAnchor = useScrollToAnchor();
	const { isFr, translateUI, translateSkill } = useTranslate();
	const [search, setSearch] = useState<string>();
	const [selectedFamily, setSelectedFamily] = useState<string | undefined>();
	const [selectedRank, setSelectedRank] = useState<string | undefined>();
	const filtersRef = useRef<HTMLDivElement | null>(null);
	useStickyBar(filtersRef);
	const allMonsters = useMemo(() => indexMonsters(props.families), [props.families]);
	const { trees, preferred, walk, pickInTrail, clearTrail } =
		useSynthesisTrail(allMonsters);
	const {
		entries,
		stock,
		goals,
		toggleGoal,
		clearGoals,
		reserve,
		open: reserveOpen,
		toggleReserve,
		expanded: reserveExpanded,
		toggleExpanded: toggleReserveExpanded,
		addToReserve,
		removeFromReserve,
		dropFromReserve,
		clearReserve,
	} = useReserve(game.key);
	const hasDetails = !!Object.keys(details).length;
	const hasSpawns = !!Object.keys(spawns).length;
	const detailsValue = useMemo(
		() => ({ details, terms, farewell, items, spawns, talents, hasDetails, hasSpawns }),
		[details, terms, farewell, items, spawns, talents, hasDetails, hasSpawns]
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

	const listFamilies = useMemo(() => {
		const result: Families = {};
		for (const { family, rank, monsters } of filtered.entries) {
			if (!result[family]) result[family] = {};
			result[family][rank] = monsters;
		}
		return result;
	}, [filtered]);
	const familyKeys = useMemo(() => Object.keys(listFamilies), [listFamilies]);
	const accordion = useFamilyAccordion(familyKeys);

	const hashFamily = useMemo(() => {
		if (!hash) return undefined;
		for (const { family, rank, monsters } of filtered.entries) {
			if (
				hash === family ||
				hash === `${family}-${rank}` ||
				monsters.some(m => m.name === hash)
			) {
				return family;
			}
		}
		return undefined;
	}, [hash, filtered]);

	const scrolledNavRef = useRef<number>();
	useEffect(() => {
		if (!hash || filtered.total === 0 || scrolledNavRef.current === nav) return;
		const idx =
			filtered.monsterIndex[hash] ??
			filtered.rankStart[hash] ??
			filtered.familyStart[hash];
		if (idx !== undefined && hashFamily && accordion.open !== hashFamily) {
			accordion.openFamily(hashFamily);
			return;
		}
		const firstHashOfSession = scrolledNavRef.current === undefined;
		if (scrollToAnchor(hash, firstHashOfSession ? 'auto' : 'smooth')) {
			scrolledNavRef.current = nav;
		}
	}, [hash, nav, filtered, hashFamily, accordion.open]);

	const searchIndex = useMemo(() => {
		const index: StringObject = {};
		Object.values(props.families).forEach(ranks =>
			Object.values(ranks).forEach(monsters =>
				monsters.forEach(monster => {
					const parts = [monster.name];
					if (isFr && monster.nom) parts.push(monster.nom);
					const skill = details[monster.name]?.skill;
					const term = skill ? terms.skills[skill] : undefined;
					if (term?.en) parts.push(term.en);
					if (isFr && term?.en) parts.push(translateSkill(term.en));
					index[monster.name] = parts.map(stringToKey).join('|');
				})
			)
		);
		return index;
	}, [props.families, isFr, details, terms, translateSkill]);

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
								searchIndex[monster.name]?.includes(search)
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
	}, [search, props.families, searchIndex]);

	const resetFilters = useCallback(() => {
		setSelectedFamily(undefined);
		setSelectedRank(undefined);
		setSearch(undefined);
	}, []);

	const filters = useMemo(
		() => ({ resetFilters, navigate, search, selectedFamily, selectedRank }),
		[resetFilters, navigate, search, selectedFamily, selectedRank]
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
			<div ref={filtersRef} className="synthesis-filters mb-4">
				<SearchBar
					label={translateUI('Search a monster or a skill set')}
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
							<ReserveContext.Provider value={reserve}>
								{filtered.total > 0 ?
									<>
										<div className="synthesis-list">
											{Object.entries(listFamilies).map(
												([family, ranks]) => (
													<FamilySection
														key={family}
														family={family}
														ranks={ranks}
														count={filtered.familyTotals[family]}
														hash={hash}
														open={accordion.open === family}
														collapsible={familyKeys.length > 1}
														onToggle={accordion.toggle}
														onHeader={accordion.registerHeader}
													/>
												)
											)}
										</div>
									</>
								:	<p>{translateUI('No synthesis found')}.</p>}
								<SynthesisTrail
									trees={trees}
									preferred={preferred}
									onPick={pickInTrail}
									onClear={clearTrail}
								/>
								<ReserveSidebar
									entries={entries}
									goals={goals}
									onToggleGoal={toggleGoal}
									onClearGoals={clearGoals}
									stock={stock}
									monsters={allMonsters}
									ranks={game.ranks}
									open={reserveOpen}
									expanded={reserveExpanded}
									onToggle={toggleReserve}
									onToggleExpanded={toggleReserveExpanded}
									onAdd={addToReserve}
									onRemove={removeFromReserve}
									onDrop={dropFromReserve}
									onClear={clearReserve}
								/>
							</ReserveContext.Provider>
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
	open,
	collapsible,
	onToggle,
	onHeader,
}: {
	family: string;
	hash?: string;
	ranks: { [key: string]: MonsterInterface[] };
	count: number;
	open: boolean;
	collapsible: boolean;
	onToggle: (family: string) => void;
	onHeader: (family: string, el: HTMLElement | null) => void;
}) => {
	const { translateUI } = useTranslate();
	const { selectedFamily, selectedRank } = useContext(FiltersContext);
	const { hasDetails, hasSpawns } = useContext(DetailsContext);
	const headerRef = useCallback(
		(el: HTMLHeadingElement | null) => onHeader(family, el),
		[family, onHeader]
	);
	const panelId = `${stringToKey(family)}-panel`;

	if (selectedFamily && selectedFamily != family) return null;
	return (
		<section className={makeClassName('family-section', open && 'open')}>
			<h2
				ref={headerRef}
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
				<button
					type="button"
					className="family-toggle"
					aria-expanded={open}
					aria-controls={panelId}
					aria-disabled={!collapsible || undefined}
					onClick={() => onToggle(family)}
				>
					<Family name={family} big />
					<span className="family-name">{translateUI(family)}</span>
					<span className="family-count">
						{count}&nbsp;{translateUI(count > 1 ? 'monsters' : 'monster')}
					</span>
					{collapsible && (
						<Icon name="chevron-down" className="family-chevron" />
					)}
				</button>
			</h2>
			{open && (
				<div className="table-responsive" id={panelId}>
					<table className="table synthesis-table">
						<thead>
							<tr>
								<th className="cell-monster">{translateUI('Monster')}</th>
								<th className="cell-details" />
								<th className="cell-family">{translateUI('Family')}</th>
								<th className="cell-rank">{translateUI('Rank')}</th>
								{hasDetails && (
									<th className="cell-skill">
										{translateUI('Skill set')}
									</th>
								)}
								<th className="cell-synthesis">{translateUI('Synthesis')}</th>
								<th className="cell-rev-synthesis">
									{translateUI('Synthesize into')}
								</th>
								{hasSpawns && (
									<th className="cell-spawn">{translateUI('Location')}</th>
								)}
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
			)}
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
	const { hasDetails, hasSpawns } = useContext(DetailsContext);
	const columns = 6 + (hasDetails ? 1 : 0) + (hasSpawns ? 1 : 0);
	const hashId = `${family}-${rank}`;
	return (
		<tbody ref={ref as any} className="rank-group">
			<tr>
				<th colSpan={columns} className="group-cell pe-0">
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
			{ranking.map((monster, i) => {
				const id =
					ranking.findIndex(m => m.name === monster.name) === i ?
						monster.name
					:	`${monster.name}-${monster.version}`;
				return visible ?
						<MonsterRow key={id} id={id} monster={monster} hash={hash} />
					:	<MonsterRowLoading key={id} id={id} monster={monster} hash={hash} />;
			})}
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

		const images = pickImages(
			require('../json/monstersImages.json'),
			familiesImageNames(families)
		);
		const details = gameDetails(defaultGame);
		const terms = gameTerms(defaultGame);
		const farewell = gameFarewell(defaultGame);
		const items = gameItems(defaultGame);
		const spawns = gameSpawns(defaultGame);
		const talents = gameTalents(defaultGame, details);
		return {
			props: {
				families,
				images,
				details,
				terms,
				farewell,
				items,
				spawns,
				talents,
				game,
			},
		};
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageLines;
