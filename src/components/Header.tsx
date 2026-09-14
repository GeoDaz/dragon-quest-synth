import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { DISCORD_URL } from '@/consts/env';
import DropdownMenu from './DropdownMenu';
import Digivice from '@/svgs/digivice';
import Pokeball from '@/svgs/pokeball';
import Millennium from '@/svgs/millennium';
import Slime from '@/svgs/slime';

const DIGIMON_URL = 'https://digimon-lines.com';
const YUGIOH_URL = 'https://yugioh-lines.netlify.app';

const gameMenu = (Svg: React.FC<React.SVGProps<SVGSVGElement>>, label: string) => ({
	className: 'nav-link',
	toggle: {
		content: (
			<>
				<Svg className="svg-icon d-md-none" role="img" aria-label={label} />
				<span className="d-none d-md-inline">{label}</span>
			</>
		),
	},
	header: { content: label, className: 'd-md-none' },
});

const externalItem = (href: string, content: string) => ({
	href,
	target: '_blank',
	rel: 'noopener noreferrer',
	content,
});

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid className="justify-content-start">
				<Navbar.Brand as={Link} href="/">
					<Image
						src="/images/dragon-quest-synth.png"
						alt="logo"
						height="26"
						width="32"
					/>{' '}
					<span className="d-none d-sm-inline-block d-lg-none ">DQ Synths</span>
					<span className="d-none d-lg-inline-block">
						Dragon Quest Synthesis
					</span>
				</Navbar.Brand>
				<Nav className="flex-grow-1">
					<DropdownMenu
						{...gameMenu(Slime, 'Dragon Quest')}
						items={[
							{ href: '/build', content: 'Builder' },
							{ href: '/', content: 'Synthesis' },
							{ href: '/bosses', content: 'Bosses' },
						]}
					/>
					<DropdownMenu
						{...gameMenu(Digivice, 'Digimon')}
						items={[
							externalItem(`${DIGIMON_URL}/build`, 'Builder'),
							externalItem(DIGIMON_URL, 'Families'),
							externalItem(`${DIGIMON_URL}/list`, 'List'),
							externalItem(`${DIGIMON_URL}/groups`, 'Groups'),
							externalItem(`${DIGIMON_URL}/vbs`, 'DIM'),
						]}
					/>
					<DropdownMenu
						{...gameMenu(Pokeball, 'Pokémon')}
						items={[externalItem(`${DIGIMON_URL}/build/pokemon`, 'Builder')]}
					/>
					<DropdownMenu
						{...gameMenu(Millennium, 'Yu-Gi-Oh!')}
						items={[
							externalItem(YUGIOH_URL, 'Deck Randomizer'),
							externalItem(`${YUGIOH_URL}/build`, 'Steps Builder'),
						]}
					/>
				</Nav>
				<div className="d-flex gap-3">
					<Link
						className="btn btn-outline-primary"
						href={DISCORD_URL}
						target="_blank"
						rel="nofollow noopener noreferrer"
						title="discord"
					>
						<span className="d-none d-lg-inline-block align-middle">
							Join us&nbsp;!
						</span>{' '}
						<Icon className="fs-6 align-middle" name="discord" />
					</Link>
				</div>
			</Container>
		</Navbar>
	</header>
);
export default Header;
