import { Fragment, useMemo, useState } from 'react';
import Line, { LineColumn, LineFrom, LinePoint } from '@/types/Line';
import { makeClassName } from '@/functions';
import { familiesIcons } from '@/consts/data';
import useTranslate from '@/hooks/useTranslate';
import { TrailNode, findNode, height, isFamily } from '@/hooks/useSynthesisTrail';
import AnchorLink from '../AnchorLink';
import Icon from '../Icon';
import LineGrid from '../Line/LineGrid';
import Family from './Family';
import MonsterImg from './MonsterImg';

const TRAIL_ZOOM = 50;
const RENDER_HEIGHT = 6;

const familyName = (name: string) => name.replace(' Family', '');

const familyImage = (name: string) => {
	const icon = familiesIcons[familyName(name)];
	return icon && `/images/family/${icon}`;
};

interface Placed {
	node: TrailNode;
	col: number;
	row: number;
	xSize?: number;
	from: LineFrom;
}

const capped = (node: TrailNode, left: number): TrailNode =>
	left <= 0 || !node.parents?.length ?
		{ name: node.name, rank: node.rank }
	:	{ ...node, parents: node.parents.map(parent => capped(parent, left - 1)) };

const slot = (node: TrailNode): number =>
	node.parents?.length ?
		node.parents.length * Math.max(...node.parents.map(slot))
	:	1;

const buildTrailLine = (trees: TrailNode[]): Line => {
	const shown = trees.map(tree => capped(tree, RENDER_HEIGHT));
	if (!shown.length) return { size: 0, columns: [] };

	const placed: Placed[] = [];
	const walk = (node: TrailNode, left: number, width: number, row: number): number => {
		const centre = left + (width - 1) / 2;
		const share = node.parents?.length ? width / node.parents.length : 0;
		const parents = (node.parents || []).map((parent, i) =>
			walk(parent, left + i * share, share, row - 1)
		);
		const between = centre % 1 != 0;
		placed.push({
			node,
			col: between ? centre - 0.5 : centre,
			row,
			xSize: between ? 2 : undefined,
			from: parents.length ? parents.map(c => [c - centre, -1]) : null,
		});
		return centre;
	};

	const rows = Math.max(...shown.map(height)) + 1;
	let left = 0;
	shown.forEach(tree => {
		const width = slot(tree);
		walk(tree, left, width, rows - 1);
		left += width + 1;
	});

	const columns: LineColumn[] = Array.from({ length: Math.max(left - 1, 1) }, () =>
		Array.from({ length: rows }, () => null)
	);
	placed.forEach(({ node, col, row, xSize, from }) => {
		const image = isFamily(node.name) ? familyImage(node.name) : undefined;
		columns[col][row] = {
			name: node.name,
			from,
			...(xSize && { xSize }),
			...(image && { image, family: true }),
			...(image && node.rank && { rank: node.rank }),
		} as LinePoint;
	});

	return { size: rows, columns };
};

interface Step {
	node: TrailNode;
	mates: TrailNode[];
}

const spine = (tree: TrailNode, preferred?: string): Step[] => {
	const steps: Step[] = [];
	let node: TrailNode | undefined = tree;
	while (node) {
		const parents: TrailNode[] | undefined = node.parents;
		if (!parents?.length) {
			steps.unshift({ node, mates: [] });
			break;
		}
		const chosen: TrailNode =
			(preferred && parents.find(parent => !!findNode(parent, preferred))) ||
			parents.reduce((a, b) => (height(b) > height(a) ? b : a));
		steps.unshift({ node, mates: parents.filter(parent => parent !== chosen) });
		node = chosen;
	}
	return steps;
};

interface Props {
	trees: TrailNode[];
	preferred?: string;
	onPick: (name: string) => void;
	onClear: () => void;
}
const SynthesisTrail: React.FC<Props> = ({ trees, preferred, onPick, onClear }) => {
	const [open, setOpen] = useState(false);
	const { isFr, translateUI } = useTranslate();
	const line = useMemo(() => buildTrailLine(trees), [trees]);

	if (!trees.length) return null;

	const toggleTitle =
		isFr ?
			open ? 'Replier la synthèse'
			:	'Déplier la synthèse'
		: open ? 'Collapse the synthesis'
		: 'Expand the synthesis';

	return (
		<aside className={makeClassName('synthesis-trail', open && 'open')}>
			{open && (
				<div className="trail-preview">
					<LineGrid line={line} zoom={TRAIL_ZOOM} />
				</div>
			)}
			<div className="trail-bar">
				<button
					type="button"
					className="trail-toggle"
					onClick={() => setOpen(!open)}
					aria-expanded={open}
					title={toggleTitle}
				>
					<Icon name={open ? 'chevron-down' : 'chevron-up'} />
				</button>
				<ol className="trail-steps">
					{trees.map((tree, t) => (
						<Fragment key={t}>
							{t > 0 && <li className="trail-split" aria-hidden="true" />}
							{spine(tree, preferred).map(({ node, mates }, i) => (
								<li key={`${node.name}-${i}`} className="trail-step">
									{mates.map((mate, j) => (
										<span key={j} className="trail-step">
											<Icon name="plus-lg" className="trail-arrow" />
											<TrailTile node={mate} onPick={onPick} />
										</span>
									))}
									{i > 0 && (
										<Icon name="chevron-right" className="trail-arrow" />
									)}
									<TrailTile node={node} onPick={onPick} />
								</li>
							))}
						</Fragment>
					))}
				</ol>
				<button
					type="button"
					className="trail-clear"
					onClick={onClear}
					title={translateUI('Void')}
				>
					<Icon name="x-lg" />
				</button>
			</div>
		</aside>
	);
};

const TrailTile = ({
	node,
	onPick,
}: {
	node: TrailNode;
	onPick: (name: string) => void;
}) => {
	const { translateMonster, translateUI } = useTranslate();

	if (isFamily(node.name)) {
		const family = familyName(node.name);
		const rank =
			node.rank ?
				`${translateUI('Rank')} ${node.rank}`
			:	translateUI('Any rank');
		return (
			<AnchorLink
				hash={`${family}-${node.rank}`}
				className="trail-step-link family"
				title={`${translateUI(family)} · ${rank}`}
			>
				<Family name={family} />
				<span className="trail-step-name">{rank}</span>
			</AnchorLink>
		);
	}

	const label = translateMonster(node.name);
	return (
		<AnchorLink
			hash={node.name}
			className="trail-step-link"
			title={label}
			onNavigate={() => onPick(node.name)}
		>
			<MonsterImg name={node.name} small title={label} />
			<span className="trail-step-name">{label}</span>
		</AnchorLink>
	);
};

export default SynthesisTrail;
