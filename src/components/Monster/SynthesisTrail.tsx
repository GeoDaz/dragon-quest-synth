import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import Line, { LineColumn, LineFrom, LinePoint } from '@/types/Line';
import { makeClassName } from '@/functions';
import useDownloadImg from '@/hooks/useDownloadImg';
import { familiesIcons } from '@/consts/data';
import useTranslate from '@/hooks/useTranslate';
import {
	TrailNode,
	TrailPick,
	findNode,
	height,
	isFamily,
	nodeAt,
} from '@/hooks/useSynthesisTrail';
import AnchorLink from '../AnchorLink';
import Icon from '../Icon';
import LineGrid from '../Line/LineGrid';
import Family from './Family';
import Lower from './Lower';
import MonsterImg from './MonsterImg';

const TRAIL_ZOOM = 50;
const RENDER_HEIGHT = 8;
const MIN_PREVIEW_HEIGHT = 80;
const PREVIEW_HEIGHT_KEY = 'trail-preview-height';

const familyName = (name: string) => name.replace(' Family', '');

const LOWER_IMAGE = '/images/lower.svg';

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
	path: number[];
}

interface TrailLine {
	line: Line;
	paths: Record<string, number[]>;
}

const capped = (node: TrailNode, left: number): TrailNode =>
	left <= 0 || !node.parents?.length ?
		{ name: node.name, rank: node.rank, plus: node.plus, lower: node.lower }
	:	{ ...node, parents: node.parents.map(parent => capped(parent, left - 1)) };

const buildTrailLine = (trees: TrailNode[]): TrailLine => {
	const shown = trees.map(tree => capped(tree, RENDER_HEIGHT));
	if (!shown.length) return { line: { size: 0, columns: [] }, paths: {} };

	const placed: Placed[] = [];
	const walk = (
		node: TrailNode,
		left: number,
		row: number,
		path: number[]
	): { centre: number; width: number } => {
		if (!node.parents?.length) {
			placed.push({ node, col: left, row, from: null, path });
			return { centre: left, width: 1 };
		}
		const centres: number[] = [];
		let offset = left;
		node.parents.forEach((parent, i) => {
			const laid = walk(parent, offset, row - 1, [...path, i]);
			centres.push(laid.centre);
			offset += laid.width;
		});
		const midpoint = centres.reduce((sum, c) => sum + c, 0) / centres.length;
		const centre = Math.max(left, Math.round(midpoint * 2) / 2);
		const between = centre % 1 != 0;
		placed.push({
			node,
			col: between ? centre - 0.5 : centre,
			row,
			xSize: between ? 2 : undefined,
			from: centres.map(c => [c - centre, -1]),
			path,
		});
		return {
			centre,
			width: Math.max(offset - left, Math.ceil(centre + (between ? 1.5 : 1) - left)),
		};
	};

	const rows = Math.max(...shown.map(height)) + 1;
	let left = 0;
	shown.forEach((tree, t) => {
		left += walk(tree, left, rows - 1, [t]).width + 1;
	});

	const columns: LineColumn[] = Array.from({ length: Math.max(left - 1, 1) }, () =>
		Array.from({ length: rows }, () => null)
	);
	const paths: Record<string, number[]> = {};
	placed.forEach(({ node, col, row, xSize, from, path }) => {
		paths[`${col},${row}`] = path;
		const image =
			node.lower ? LOWER_IMAGE
			: isFamily(node.name) ? familyImage(node.name)
			: undefined;
		columns[col][row] = {
			name: node.name,
			from,
			...(xSize && { xSize }),
			...(image && { image, family: true }),
			...(image && node.rank && { rank: node.rank }),
			...(node.plus && { plus: node.plus }),
		} as LinePoint;
	});

	return { line: { size: rows, columns }, paths };
};

const storedHeight = () => {
	try {
		const value = Number(localStorage.getItem(PREVIEW_HEIGHT_KEY));
		return value > 0 ? value : undefined;
	} catch {
		return undefined;
	}
};

const maxPreviewHeight = () => window.innerHeight - 160;

interface Placement {
	node: TrailNode;
	path: number[];
}

interface Step extends Placement {
	mates: Placement[];
}

const spine = (tree: TrailNode, t: number, preferred?: TrailPick): Step[] => {
	const steps: Step[] = [];
	let follow =
		preferred?.path[0] == t && nodeAt([tree], preferred.path)?.name == preferred.name ?
			preferred.path.slice(1)
		:	[];
	let node: TrailNode = tree;
	let path = [t];
	while (true) {
		const parents: TrailNode[] | undefined = node.parents;
		if (!parents?.length) {
			steps.unshift({ node, path, mates: [] });
			break;
		}
		let chosen = follow.length ? follow[0] : -1;
		follow = follow.slice(1);
		if (chosen < 0 && preferred)
			chosen = parents.findIndex(parent => !!findNode(parent, preferred.name));
		if (chosen < 0)
			chosen = parents.reduce(
				(best, parent, i) => (height(parent) > height(parents[best]) ? i : best),
				0
			);
		const parentPath = path;
		steps.unshift({
			node,
			path,
			mates: parents
				.map((parent, i) => ({ node: parent, path: [...parentPath, i] }))
				.filter((_, i) => i != chosen),
		});
		node = parents[chosen];
		path = [...path, chosen];
	}
	return steps;
};

interface Props {
	trees: TrailNode[];
	preferred?: TrailPick;
	onPick: (pick: TrailPick) => void;
	onClear: () => void;
	onCut: (path: number[]) => void;
}
const SynthesisTrail: React.FC<Props> = ({ trees, preferred, onPick, onClear, onCut }) => {
	const [open, setOpen] = useState(false);
	const [zoom, setZoom] = useState(TRAIL_ZOOM);
	const [previewHeight, setPreviewHeight] = useState<number | undefined>();
	const ref = useRef<HTMLElement>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const { translateUI } = useTranslate();
	const { line, paths } = useMemo(() => buildTrailLine(trees), [trees]);

	useEffect(() => setPreviewHeight(storedHeight()), []);

	const handleCut = useCallback(
		(coord: number[]) => {
			const path = paths[`${coord[0]},${coord[1]}`];
			if (path) onCut(path);
		},
		[paths, onCut]
	);

	const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
		const frame = previewRef.current?.querySelector<HTMLElement>('.frame');
		if (!frame) return;
		e.preventDefault();
		const handle = e.currentTarget;
		handle.setPointerCapture(e.pointerId);
		const startY = e.clientY;
		const startHeight = frame.offsetHeight;
		let height = startHeight;
		const move = (event: PointerEvent) => {
			height = Math.round(
				Math.min(
					Math.max(startHeight + startY - event.clientY, MIN_PREVIEW_HEIGHT),
					maxPreviewHeight()
				)
			);
			setPreviewHeight(height);
		};
		const end = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', end);
			handle.removeEventListener('pointercancel', end);
			try {
				localStorage.setItem(PREVIEW_HEIGHT_KEY, String(height));
			} catch {}
		};
		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', end);
		handle.addEventListener('pointercancel', end);
	};

	const handleResizeReset = () => {
		setPreviewHeight(undefined);
		try {
			localStorage.removeItem(PREVIEW_HEIGHT_KEY);
		} catch {}
	};
	const { downloadImage, downloading, error } = useDownloadImg(
		trees.map(tree => tree.name).join('-')
	);

	const shown = !!trees.length;

	useEffect(() => {
		const element = ref.current;
		if (!shown || !element) return;
		const root = document.documentElement;
		const observer = new ResizeObserver(() =>
			root.style.setProperty('--dl-trail-height', `${element.offsetHeight}px`)
		);
		observer.observe(element);
		return () => {
			observer.disconnect();
			root.style.removeProperty('--dl-trail-height');
		};
	}, [shown]);

	const handleDownload = () => {
		setOpen(true);
		setZoom(100);
		downloadImage('.trail-preview .line-wrapper').then(() => setZoom(TRAIL_ZOOM));
	};

	if (!shown) return null;

	const toggleTitle = translateUI(
		open ? 'Collapse the synthesis' : 'Expand the synthesis'
	);

	return (
		<aside ref={ref} className={makeClassName('synthesis-trail', open && 'open')}>
			{open && (
				<>
					<div
						className="trail-resizer"
						role="separator"
						aria-orientation="horizontal"
						title={translateUI('Resize')}
						onPointerDown={handleResizeStart}
						onDoubleClick={handleResizeReset}
					/>
					<div
						ref={previewRef}
						className="trail-preview"
						style={
							previewHeight ?
								({
									'--dl-trail-preview-height': `${previewHeight}px`,
								} as React.CSSProperties)
							:	undefined
						}
					>
						<LineGrid line={line} zoom={zoom} handleCut={handleCut} />
					</div>
				</>
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
							{spine(tree, t, preferred).map(({ node, path, mates }, i) => (
								<li key={`${node.name}-${i}`} className="trail-step">
									{mates.map((mate, j) => (
										<span key={j} className="trail-step">
											<Icon name="plus-lg" className="trail-arrow" />
											<TrailTile
												node={mate.node}
												path={mate.path}
												onPick={onPick}
											/>
										</span>
									))}
									{i > 0 && (
										<Icon name="chevron-right" className="trail-arrow" />
									)}
									<TrailTile node={node} path={path} onPick={onPick} />
								</li>
							))}
						</Fragment>
					))}
				</ol>
				<button
					type="button"
					className={makeClassName('trail-toggle', error && 'failed')}
					onClick={handleDownload}
					disabled={downloading}
					title={error || translateUI('Download the image')}
				>
					{downloading ?
						<Spinner animation="border" size="sm" />
					:	<Icon name="download" />}
				</button>
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
	path,
	onPick,
}: {
	node: TrailNode;
	path: number[];
	onPick: (pick: TrailPick) => void;
}) => {
	const { translateMonster, translateUI } = useTranslate();

	if (node.lower) {
		return (
			<span
				className="trail-step-link lower-step"
				title={translateUI('Lower monster')}
			>
				<Lower described={false} />
				<span className="trail-step-name">{translateUI('Lower')}</span>
				{!!node.plus && <span className="line-point-plus">+{node.plus}</span>}
			</span>
		);
	}

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
				{!!node.plus && <span className="line-point-plus">+{node.plus}</span>}
			</AnchorLink>
		);
	}

	const label = translateMonster(node.name);
	return (
		<AnchorLink
			hash={node.name}
			className="trail-step-link"
			title={label}
			onNavigate={() => onPick({ name: node.name, path })}
		>
			<MonsterImg name={node.name} small title={label} />
			<span className="trail-step-name">{label}</span>
			{!!node.plus && <span className="line-point-plus">+{node.plus}</span>}
		</AnchorLink>
	);
};

export default SynthesisTrail;
