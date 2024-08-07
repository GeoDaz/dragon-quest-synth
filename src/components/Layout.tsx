import React from 'react';
import { Container } from 'react-bootstrap';
import GoBack from '@/components/GoBack';
import Head from 'next/head';
import { SITE_URL } from '@/consts/env';
import { makeClassName } from '@/functions';

interface Props {
	title: string | React.ReactNode;
	children: React.ReactNode;
	metatitle?: string;
	metadescription?: string;
	metaimg?: string;
	noGoBack?: boolean;
	className?: string;
}
const Layout: React.FC<Props> = ({
	title,
	children,
	metatitle,
	metadescription,
	metaimg = 'og_image.png',
	noGoBack = false,
	className,
}) => {
	const trueMetaTitle = metatitle
		? `${metatitle} | Dragon Quest Synthesis`
		: 'Dragon Quest Synthesis';
	return (
		<>
			<Head>
				<title>{trueMetaTitle}</title>
				<meta name="title" content={trueMetaTitle} />
				<meta name="og:title" content={trueMetaTitle} />
				{/* here because refused from _document.tsx */}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="description"
					content={metadescription || 'List of Dragon Quest Synthesis'}
				/>
				<meta
					name="og:description"
					content={metadescription || 'List of Dragon Quest Synthesis'}
				/>
				<meta property="og:image" content={`${SITE_URL}/images/${metaimg}`} />
			</Head>
			<main>
				<Container className={makeClassName('page', className)} fluid>
					<h1>
						{!noGoBack && <GoBack />} {title}
					</h1>
					{children}
				</Container>
			</main>
		</>
	);
};
export default Layout;
