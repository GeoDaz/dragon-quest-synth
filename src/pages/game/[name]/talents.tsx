import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GetStaticProps } from 'next';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import Layout from '@/components/Layout';
import GameCard from '@/components/GameCard';
import GameTabs from '@/components/GameTabs';
import SearchBar from '@/components/SearchBar';
import AnchorLink from '@/components/AnchorLink';
import Icon from '@/components/Icon';
import ScrollUp from '@/components/ScrollUp';
import Talent from '@/components/Monster/Talent';
import { DetailsContext, emptyTalents, emptyTerms } from '@/context/details';
import { FiltersContext } from '@/context/filter';
import { GameTalent, GameTalents, GameTerms } from '@/types/MonsterDetails';
import { Game } from '@/types/Game';
import { games } from '@/functions/games';
import { makeClassName, stringToKey } from '@/functions';
import useTranslate from '@/hooks/useTranslate';
import useHash from '@/hooks/useHash';
import useScrollToAnchor from '@/hooks/useScrollToAnchor';
import useStickyBar from '@/hooks/useStickyBar';
import { gameHasTalentRecipes, gameTalentRecipes, gameTerms } from '../..';

const categoryLabels: { [category: string]: string } = {
	Evolution: 'Evolved skill sets',
	Combination: 'Combined skill sets',
};

const categoryDescriptions: { [category: string]: string } = {
	Evolution:
		'Obtained by synthesizing a monster that has reached the right amount of SP in the previous skill set, or by synthesizing 2 monsters that have this same skill set with the right amount of SP between them.',
	Combination:
		'Obtained by synthesizing 2 monsters that each have one of the required skill sets with the right amount of SP.',
};

const categoryLabel = (category: string) => categoryLabels[category] || category;

const isBonus = (talent: GameTalent) =>
	talent.moves.every(({ move }) => talent.traits?.includes(move));

const orderRecipes = <T extends [string, GameTalent]>(list: T[]): T[] => {
	const byName = new Map(list.map(entry => [entry[0], entry]));
	const index = new Map(list.map(([name], i) => [name, i]));
	const used = new Set(list.flatMap(([, talent]) => talent.from?.flat() || []));
	const ordered: T[] = [];
	const seen = new Set<string>();
	const visit = (name: string) => {
		const entry = byName.get(name);
		if (!entry || seen.has(name)) return;
		seen.add(name);
		Array.from(new Set(entry[1].from?.flat()))
			.sort((a, b) => (index.get(a) ?? -1) - (index.get(b) ?? -1))
			.forEach(visit);
		ordered.push(entry);
	};
	const finals = list.filter(([name]) => !used.has(name));
	const groupKey = (name: string) => name.split(' ').pop() || name;
	const rank = ([name, talent]: T) =>
		isBonus(talent) ? 2
		: name.endsWith(' Virtuoso') ? 1
		: 0;
	const groupStart = new Map<string, number>();
	finals.forEach(([name], i) => {
		if (!groupStart.has(groupKey(name))) groupStart.set(groupKey(name), i);
	});
	finals
		.map((entry, i) => ({ entry, i }))
		.sort(
			(a, b) =>
				rank(a.entry) - rank(b.entry) ||
				groupStart.get(groupKey(a.entry[0]))! - groupStart.get(groupKey(b.entry[0]))! ||
				a.i - b.i
		)
		.forEach(({ entry: [name] }) => visit(name));
	list.forEach(([name]) => visit(name));
	return ordered;
};

interface Props {
	game: Game;
	terms: GameTerms;
	talents: GameTalents;
	talentGames: string[];
}

export const getStaticPaths = async () => {
	const paths = Object.values(games)
		.filter(game => game.available && gameHasTalentRecipes(game.key))
		.map(game => ({ params: { name: game.key } }));
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const gameName = params?.name as string;
	const game = games[gameName];
	if (!game?.available || !gameHasTalentRecipes(gameName)) {
		return { notFound: true };
	}
	return {
		props: {
			game,
			terms: gameTerms(gameName),
			talents: gameTalentRecipes(gameName),
			talentGames: Object.values(games)
				.filter(game => game.available && gameHasTalentRecipes(game.key))
				.map(game => game.key),
		},
	};
};

const TalentsPage: React.FC<Props> = ({
	game,
	terms = emptyTerms,
	talents = emptyTalents,
	talentGames = [],
}) => {
	const { translateUI, translateSkill, isFr } = useTranslate();
	const { hash, nav, navigate } = useHash();
	const scrollToAnchor = useScrollToAnchor();
	const [search, setSearch] = useState<string>();
	const [selectedCategory, setSelectedCategory] = useState<string>();
	const filtersRef = useRef<HTMLDivElement | null>(null);
	useStickyBar(filtersRef);

	const recipes = useMemo(
		() =>
			Object.entries(talents.talents).filter(
				(entry): entry is [string, (typeof entry)[1] & { from: string[][] }] =>
					!!entry[1].from?.length
			),
		[talents]
	);
	const categories = useMemo(
		() =>
			Array.from(new Set(recipes.map(([, talent]) => talent.category || 'Evolution'))).sort(
				(a, b) => Number(b == 'Combination') - Number(a == 'Combination')
			),
		[recipes]
	);

	const searchKey = (name: string) => {
		const en = terms.skills[name]?.en || name;
		const parts = [name, en];
		if (isFr) parts.push(translateSkill(en));
		return parts.map(stringToKey).join('|');
	};

	const filtered = useMemo(
		() =>
			recipes.filter(([name, talent]) => {
				if (selectedCategory && (talent.category || 'Evolution') != selectedCategory) {
					return false;
				}
				if (!search) return true;
				return [name, ...talent.from.flat()].some(n => searchKey(n).includes(search));
			}),
		[recipes, selectedCategory, search, isFr, terms]
	);

	const resetFilters = () => {
		setSearch(undefined);
		setSelectedCategory(undefined);
	};

	const scrolledNavRef = useRef<number | undefined>(undefined);
	useEffect(() => {
		if (!hash || scrolledNavRef.current === nav) return;
		if (scrollToAnchor(hash, scrolledNavRef.current === undefined ? 'auto' : 'smooth')) {
			scrolledNavRef.current = nav;
		}
	}, [hash, nav, filtered]);

	const handleSearch = (value: string) => {
		let sanitizedSearch = stringToKey(value || '');
		if (sanitizedSearch.length < 3) sanitizedSearch = '';
		setSearch(sanitizedSearch || undefined);
	};

	const detailsValue = useMemo(
		() => ({
			details: {},
			terms,
			farewell: { items: [], amounts: [] },
			items: {},
			spawns: {},
			talents,
			hasDetails: false,
			hasSkills: true,
			hasSpawns: false,
		}),
		[terms, talents]
	);

	return (
		<Layout
			noGoBack
			title={translateUI('Skill sets')}
			metatitle={`${game.title} ${translateUI('Skill sets')}`}
			metadescription={`${game.title}: every skill set obtained by evolving or combining maxed skill sets, with the SP needed and the skills and traits they unlock.`}
			className="overflow-visible"
		>
			<ScrollUp />
			<div className="row mb-4">
				{Object.values(games)
					.filter(_game => _game.available)
					.map((_game: Game) => (
						<div
							key={_game.key}
							className="game-card-col col-4 col-sm-3 d-flex mb-2 mb-md-3 mb-lg-4"
						>
							<GameCard
								game={_game}
								currentGame={game.key}
								href={
									talentGames.includes(_game.key) ?
										`/game/${_game.key}/talents`
									:	undefined
								}
							/>
						</div>
					))}
			</div>
			<GameTabs game={game.key} active="talents" />
			<div ref={filtersRef} className="synthesis-filters mb-4">
				<SearchBar
					label={translateUI('Search a skill set')}
					onSubmit={handleSearch}
					defaultValue={search}
				/>
				{categories.length > 1 && (
					<DropdownButton
						id="category-selector"
						className={makeClassName(
							'filter-dropdown',
							!!selectedCategory && 'filter-active'
						)}
						title={translateUI(selectedCategory ? categoryLabel(selectedCategory) : 'Category')}
					>
						{!!selectedCategory && (
							<Dropdown.Item onClick={() => setSelectedCategory(undefined)}>
								<Icon name="x" /> {translateUI('Void')}
							</Dropdown.Item>
						)}
						{categories.map(category => (
							<Dropdown.Item
								key={category}
								active={selectedCategory == category}
								onClick={() => setSelectedCategory(category)}
							>
								{translateUI(categoryLabel(category))}
							</Dropdown.Item>
						))}
					</DropdownButton>
				)}
				{(!!search || !!selectedCategory) && (
					<button type="button" className="filter-reset" onClick={resetFilters}>
						<Icon name="x" /> {translateUI('Clear filters')}
					</button>
				)}
				<span className="filter-count">
					{filtered.length}&nbsp;
					{translateUI(filtered.length > 1 ? 'skill sets' : 'skill set')}
				</span>
			</div>
			<FiltersContext.Provider value={{ resetFilters, navigate }}>
				<DetailsContext.Provider value={detailsValue}>
					{filtered.length > 0 ?
						categories.map(category => {
							const list = orderRecipes(
								filtered.filter(
									([, talent]) => (talent.category || 'Evolution') == category
								)
							);
							if (!list.length) return null;
							return (
								<section
									key={category}
									className={makeClassName(
										'talent-recipes mb-4',
										category == 'Combination' && 'talent-recipes-wide'
									)}
								>
									<h2 className="talent-recipes-title">
										{translateUI(categoryLabel(category))}
										<span className="talent-recipes-count">
											{list.length}&nbsp;
											{translateUI(
												list.length > 1 ? 'skill sets' : 'skill set'
											)}
										</span>
									</h2>
									{!!categoryDescriptions[category] && (
										<p className="talent-recipes-intro">
											{translateUI(categoryDescriptions[category])}
										</p>
									)}
									<div className="talent-recipe-list">
										{list.map(([name, talent]) => (
											<TalentRecipe
												key={name}
												name={name}
												from={talent.from}
												active={hash == name}
											/>
										))}
									</div>
								</section>
							);
						})
					:	<p>{translateUI('No skill set found')}.</p>}
				</DetailsContext.Provider>
			</FiltersContext.Provider>
		</Layout>
	);
};

const pairPool = (from: string[][]): { pool: string[]; rest: string[][] } | undefined => {
	const pairs = from.filter(r => r.length == 2 && r[0] != r[1]);
	const linked = new Set(pairs.map(([a, b]) => [a, b].sort().join('|')));
	const isLinked = (a: string, b: string) => linked.has([a, b].sort().join('|'));
	const nodes = Array.from(new Set(pairs.flat()));
	let best: string[] = [];
	const grow = (clique: string[], start: number) => {
		if (clique.length > best.length) best = clique;
		for (let i = start; i < nodes.length; i++) {
			if (clique.every(n => isLinked(n, nodes[i]))) grow([...clique, nodes[i]], i + 1);
		}
	};
	grow([], 0);
	if (best.length < 3) return;
	const inPool = new Set(best);
	const rest = from.filter(r => !(r.length == 2 && r[0] != r[1] && r.every(n => inPool.has(n))));
	return { pool: best, rest };
};

const ELEMENTS = ['Frizz', 'Bang', 'Woosh', 'Crack', 'Sizz', 'Zap', 'Zam'];

const elementsOf = (talent: string): string[] | undefined => {
	const m = talent.match(/^(\w+) & (\w+)(?: [\w]+)?$/);
	return m && ELEMENTS.includes(m[1]) && ELEMENTS.includes(m[2]) ? [m[1], m[2]] : undefined;
};

const elementRule = (from: string[][]) => {
	const elementRecipes = from.filter(r => r.every(n => elementsOf(n)));
	if (elementRecipes.length < 3) return;
	const covers = (r: string[]) => new Set(r.flatMap(n => elementsOf(n) as string[]));
	const target = ELEMENTS.filter(e => elementRecipes.every(r => covers(r).has(e)));
	if (target.length < 2) return;
	const talents = Array.from(new Set(elementRecipes.flat()));
	const sizes = elementRecipes.map(r => r.length);
	const [min, max] = [Math.min(...sizes), Math.max(...sizes)];
	const covering = (r: string[]) => target.every(e => covers(r).has(e));
	const expected = new Set<string>();
	const walk = (chosen: string[], start: number) => {
		if (chosen.length >= min && covering(chosen)) {
			if (chosen.every((_, i) => !covering(chosen.filter((__, j) => j != i)))) expected.add([...chosen].sort().join('|'));
			return;
		}
		if (chosen.length == max) return;
		for (let i = start; i < talents.length; i++) walk([...chosen, talents[i]], i + 1);
	};
	walk([], 0);
	const actual = new Set(elementRecipes.map(r => [...r].sort().join('|')));
	if (expected.size != actual.size || Array.from(expected).some(k => !actual.has(k))) return;
	return {
		target,
		talents,
		min,
		max,
		rest: from.filter(r => !elementRecipes.includes(r)),
	};
};

const ELEMENT_FR: { [element: string]: string } = {
	Frizz: 'Flamme',
	Bang: 'Bang',
	Woosh: 'Tornade',
	Crack: 'Glace',
	Sizz: 'Crame',
	Zap: 'Foudre',
	Zam: 'Élec',
};

type RecipeLine = string[][];

const partKey = (part: string[]) => [...part].sort().join('|');

const groupByCommon = (recipes: string[][]): RecipeLine[] => {
	let lines: RecipeLine[] = recipes.map(recipe => recipe.map(ingredient => [ingredient]));
	for (;;) {
		let merged = false;
		for (let a = 0; a < lines.length && !merged; a++) {
			for (let b = a + 1; b < lines.length && !merged; b++) {
				const [x, y] = [lines[a], lines[b]];
				if (x.length != y.length) continue;
				const yKeys = y.map(partKey);
				const onlyX = x.filter(part => {
					const i = yKeys.indexOf(partKey(part));
					if (i == -1) return true;
					yKeys.splice(i, 1);
					return false;
				});
				if (onlyX.length != 1 || yKeys.length != 1) continue;
				const onlyY = y.find(part => partKey(part) == yKeys[0]) as string[];
				const union = Array.from(new Set([...onlyX[0], ...onlyY]));
				const line = x.map(part => (part == onlyX[0] ? union : part));
				line.sort((p, q) => p.length - q.length);
				lines = [...lines.slice(0, a), line, ...lines.slice(a + 1, b), ...lines.slice(b + 1)];
				merged = true;
			}
		}
		if (!merged) return lines;
	}
};

const TalentRecipe = ({
	name,
	from,
	active,
}: {
	name: string;
	from: string[][];
	active: boolean;
}) => {
	const { translateUI } = useTranslate();
	const { talents } = React.useContext(DetailsContext);
	const points = talents.talents[name]?.points;
	const { isFr } = useTranslate();
	const rule = elementRule(from);
	const remaining = rule ? rule.rest : from;
	const pool = pairPool(remaining);
	const lines = groupByCommon(pool ? pool.rest : remaining);
	const elementList = (elements: string[]) => {
		const names = elements.map(e => (isFr ? ELEMENT_FR[e] : e));
		return `${names.slice(0, -1).join(', ')} ${translateUI('and')} ${names[names.length - 1]}`;
	};

	return (
		<article
			id={name}
			className={makeClassName('talent-recipe', active && 'active-outline')}
		>
			<div className="talent-recipe-result">
				<Talent name={name} />
			</div>
			<div className="talent-recipe-sources">
				<span className="talent-recipe-label">
					{translateUI(points ? 'Required skill sets' : 'Skill sets to max')}
				</span>
				{!!rule && (
					<>
						<span className="talent-recipe-or">
							{translateUI(rule.min == rule.max ? '{min} among the following' : '{min} to {max} among the following')
								.replace('{min}', String(rule.min))
								.replace('{max}', String(rule.max))}
							{', '}
							{translateUI('together covering')} {elementList(rule.target)}
						</span>
						<div className="talent-recipe-combo">
							{rule.talents.map(ingredient => (
								<Ingredient key={ingredient} name={ingredient} points={points?.[ingredient]} />
							))}
						</div>
					</>
				)}
				{!!pool && (
					<>
						{!!rule && <span className="talent-recipe-or">{translateUI('Or')}</span>}
						<span className="talent-recipe-or">
							{translateUI('2 among the following')}
						</span>
						<div className="talent-recipe-combo">
							{pool.pool.map(ingredient => (
								<Ingredient
									key={ingredient}
									name={ingredient}
									points={points?.[ingredient]}
								/>
							))}
						</div>
					</>
				)}
				{lines.map((line, i) => (
					<React.Fragment key={i}>
						{(i > 0 || !!pool || !!rule) && (
							<span className="talent-recipe-or">{translateUI('Or')}</span>
						)}
						<div className="talent-recipe-combo">
							{line.map((part, j) => (
								<React.Fragment key={j}>
									{j > 0 && <span className="talent-recipe-plus">+</span>}
									{part.map((ingredient, k) => (
										<React.Fragment key={`${ingredient}-${k}`}>
											{k > 0 && (
												<span className="talent-recipe-or">{translateUI('Or')}</span>
											)}
											<Ingredient name={ingredient} points={points?.[ingredient]} />
										</React.Fragment>
									))}
								</React.Fragment>
							))}
						</div>
					</React.Fragment>
				))}
			</div>
		</article>
	);
};

const Ingredient = ({ name, points }: { name: string; points?: number }) => {
	const { translateUI } = useTranslate();
	const { talents } = React.useContext(DetailsContext);
	const moves = talents.talents[name]?.moves;
	const sp = points ?? (moves?.length ? moves[moves.length - 1].sp : undefined);
	if (!talents.talents[name]?.from) {
		return (
			<span className="talent-recipe-ingredient">
				<IngredientContent name={name} sp={sp} minimum={points !== undefined} />
			</span>
		);
	}
	return (
		<AnchorLink
			hash={name}
			className="talent-recipe-ingredient talent-recipe-link"
			title={translateUI('Go to this skill set')}
		>
			<IngredientContent name={name} sp={sp} minimum={points !== undefined} />
			<Icon name="link-45deg" />
		</AnchorLink>
	);
};

const IngredientContent = ({
	name,
	sp,
	minimum,
}: {
	name: string;
	sp?: number;
	minimum?: boolean;
}) => {
	const { translateUI } = useTranslate();
	return (
		<>
			<Talent name={name} />
			{sp !== undefined && (
				<span className="talent-recipe-sp">
					{minimum && '≥ '}
					{sp}&nbsp;{translateUI('SP')}
				</span>
			)}
		</>
	);
};

export default TalentsPage;
