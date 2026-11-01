import React from 'react';
import { Container } from 'react-bootstrap';
import GoBack from '@/components/GoBack';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE_URL } from '@/consts/env';
import { makeClassName } from '@/functions';

interface Props {
	title: string | React.ReactNode;
	children: React.ReactNode;
	metatitle?: string;
	metadescription?: string;
	metaimg?: string;
	fullMetatitle?: boolean;
	noGoBack?: boolean;
	noTitle?: boolean;
	className?: string;
}
const Layout: React.FC<Props> = ({
	title,
	children,
	metatitle,
	metadescription,
	metaimg = 'site.png',
	fullMetatitle = false,
	noGoBack = false,
	noTitle = false,
	className,
}) => {
	const router = useRouter();
	const trueMetaTitle =
		!metatitle ? 'Dragon Quest Synthesis'
		: fullMetatitle ? metatitle
		: `${metatitle} | Dragon Quest Synthesis`;
	const path = router.asPath.split(/[?#]/)[0];
	const url = `${SITE_URL}${path}`;
	const indexable = router.pathname != '/404';
	return (
		<>
			<Head>
				<title>{trueMetaTitle}</title>
				<meta name="title" content={trueMetaTitle} />
				<meta property="og:title" content={trueMetaTitle} />
				{indexable && <link rel="canonical" href={url} />}
				{indexable && <meta property="og:url" content={url} />}
				{/* here because refused from _document.tsx */}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="description"
					content={metadescription || 'List of Dragon Quest Synthesis'}
				/>
				<meta
					property="og:description"
					content={metadescription || 'List of Dragon Quest Synthesis'}
				/>
				<meta property="og:image" content={`${SITE_URL}/images/${metaimg}`} />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:image" content={`${SITE_URL}/images/${metaimg}`} />
			</Head>
			<main>
				<Container className={makeClassName('page', className)} fluid>
					{!noTitle && (
						<h1>
							{!noGoBack && <GoBack />} {title}
						</h1>
					)}
					{children}
				</Container>
			</main>
		</>
	);
};
export default Layout;
