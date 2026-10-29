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
import { GameTalents, GameTerms } from '@/types/MonsterDetails';
import { Game } from '@/types/Game';
import { games } from '@/functions/games';
import { makeClassName, stringToKey } from '@/functions';
import useTranslate from '@/hooks/useTranslate';
import useHash from '@/hooks/useHash';
import useScrollToAnchor from '@/hooks/useScrollToAnchor';
import useStickyBar from '@/hooks/useStickyBar';
import { gameHasTalentRecipes, gameTalentRecipes, gameTerms } from '../..';

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
		() => Array.from(new Set(recipes.map(([, talent]) => talent.category || 'Evolution'))),
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
			metatitle={`${translateUI('Skill sets')} ${game.key}`}
			metadescription={`${game.title}: skill sets obtained by evolving or combining maxed skill sets.`}
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
			<p className="talent-recipes-intro">
				{translateUI('Skill sets obtained by evolving or combining maxed skill sets.')}
			</p>
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
						title={translateUI(selectedCategory || 'Category')}
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
								{translateUI(category)}
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
							const list = filtered.filter(
								([, talent]) => (talent.category || 'Evolution') == category
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
										{translateUI(category)}
										<span className="talent-recipes-count">
											{list.length}&nbsp;
											{translateUI(
												list.length > 1 ? 'skill sets' : 'skill set'
											)}
										</span>
									</h2>
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

const pairPool = (from: string[][]): string[] | undefined => {
	if (from.length < 3 || from.some(ingredients => ingredients.length != 2)) return;
	const pool = Array.from(new Set(from.flat()));
	return (pool.length * (pool.length - 1)) / 2 == from.length ? pool : undefined;
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
	const pool = pairPool(from);

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
					{translateUI('Skill sets to max')}
				</span>
				{pool ?
					<>
						<span className="talent-recipe-or">
							{translateUI('2 among the following')}
						</span>
						<div className="talent-recipe-combo">
							{pool.map(ingredient => (
								<Ingredient key={ingredient} name={ingredient} />
							))}
						</div>
					</>
				:	from.map((ingredients, i) => (
						<React.Fragment key={i}>
							{i > 0 && (
								<span className="talent-recipe-or">{translateUI('Or')}</span>
							)}
							<div className="talent-recipe-combo">
								{ingredients.map((ingredient, j) => (
									<React.Fragment key={ingredient}>
										{j > 0 && <span className="talent-recipe-plus">+</span>}
										<Ingredient name={ingredient} />
									</React.Fragment>
								))}
							</div>
						</React.Fragment>
					))
				}
			</div>
		</article>
	);
};

const Ingredient = ({ name }: { name: string }) => {
	const { translateUI } = useTranslate();
	const { talents } = React.useContext(DetailsContext);
	const moves = talents.talents[name]?.moves;
	const sp = moves?.length ? moves[moves.length - 1].sp : undefined;
	if (!talents.talents[name]?.from) {
		return (
			<span className="talent-recipe-ingredient">
				<IngredientContent name={name} sp={sp} />
			</span>
		);
	}
	return (
		<AnchorLink
			hash={name}
			className="talent-recipe-ingredient talent-recipe-link"
			title={translateUI('Go to this skill set')}
		>
			<IngredientContent name={name} sp={sp} />
			<Icon name="link-45deg" />
		</AnchorLink>
	);
};

const IngredientContent = ({ name, sp }: { name: string; sp?: number }) => (
	<>
		<Talent name={name} />
		{sp !== undefined && <span className="talent-recipe-sp">{sp}&nbsp;SP</span>}
	</>
);

export default TalentsPage;
