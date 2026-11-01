const nodes = [
	{ x: 60, y: 70, r: 10 },
	{ x: 60, y: 170, r: 10 },
	{ x: 60, y: 290, r: 10 },
	{ x: 60, y: 390, r: 10 },
	{ x: 250, y: 120, r: 15 },
	{ x: 250, y: 340, r: 15 },
	{ x: 470, y: 230, r: 26 },
];

const links = [
	[0, 4],
	[1, 4],
	[2, 5],
	[3, 5],
	[4, 6],
	[5, 6],
];

const curve = (a: (typeof nodes)[number], b: (typeof nodes)[number]) => {
	const mid = (a.x + b.x) / 2;
	return `M ${a.x + a.r} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x - b.r} ${b.y}`;
};

const HeroGraph = ({ className }: { className?: string }) => (
	<svg
		className={className}
		viewBox="0 0 540 460"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<defs>
			<linearGradient id="home-graph-link" x1="0" x2="1" y1="0" y2="0">
				<stop offset="0" stopColor="#2d95de" stopOpacity="0.15" />
				<stop offset="1" stopColor="#f5c542" stopOpacity="0.9" />
			</linearGradient>
			<radialGradient id="home-graph-node">
				<stop offset="0" stopColor="#7cc4ff" />
				<stop offset="1" stopColor="#0d6efd" />
			</radialGradient>
			<radialGradient id="home-graph-result">
				<stop offset="0" stopColor="#ffe9a3" />
				<stop offset="1" stopColor="#f5a623" />
			</radialGradient>
			<filter id="home-graph-glow" x="-100%" y="-100%" width="300%" height="300%">
				<feGaussianBlur stdDeviation="8" />
			</filter>
		</defs>
		{links.map(([from, to], i) => (
			<path
				key={i}
				d={curve(nodes[from], nodes[to])}
				stroke="url(#home-graph-link)"
				strokeWidth="3"
				strokeLinecap="round"
				className="home-graph-link"
				style={{ animationDelay: `${i * 0.35}s` }}
			/>
		))}
		{nodes.map(({ x, y, r }, i) => {
			const result = i == nodes.length - 1;
			return (
				<g key={i}>
					<circle
						cx={x}
						cy={y}
						r={r * 1.8}
						fill={result ? '#f5c542' : '#2d95de'}
						opacity="0.35"
						filter="url(#home-graph-glow)"
					/>
					<circle
						cx={x}
						cy={y}
						r={r}
						fill={result ? 'url(#home-graph-result)' : 'url(#home-graph-node)'}
					/>
				</g>
			);
		})}
		<path
			d="M 470 196 L 476 222 L 502 230 L 476 238 L 470 264 L 464 238 L 438 230 L 464 222 Z"
			fill="#fff8dc"
			opacity="0.9"
		/>
	</svg>
);

export default HeroGraph;
