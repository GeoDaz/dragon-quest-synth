import Link from '@/components/Link';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName } from '@/functions';

const tabs = [
	{ key: 'synthesis', label: 'Synthesis', path: '' },
	{ key: 'talents', label: 'Skill sets', path: '/talents' },
	{ key: 'areas', label: 'Areas', path: '/areas' },
];

const GameTabs = ({
	game,
	active,
	hasTalents = true,
	hasAreas = false,
}: {
	game: string;
	active: string;
	hasTalents?: boolean;
	hasAreas?: boolean;
}) => {
	const { translateUI } = useTranslate();
	return (
		<nav className="game-tabs mb-4">
			{tabs
				.filter(
					tab =>
						(hasTalents || tab.key != 'talents') && (hasAreas || tab.key != 'areas')
				)
				.map(tab => (
					<Link
						key={tab.key}
						href={`/game/${game}${tab.path}`}
						className={makeClassName('game-tab', tab.key == active && 'active')}
						aria-current={tab.key == active ? 'page' : undefined}
					>
						{translateUI(tab.label)}
					</Link>
				))}
		</nav>
	);
};

export default GameTabs;
