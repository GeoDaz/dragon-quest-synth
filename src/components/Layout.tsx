import React from 'react';
import { Container } from 'react-bootstrap';
import GoBack from '@/components/GoBack';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE_URL } from '@/consts/env';
import { makeClassName } from '@/functions';

const DEFAULT_DESCRIPTION =
	'Synthesis charts for every Dragon Quest Monsters game: recipes, what each monster synthesizes into, skill sets and locations.';

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
	breadcrumb?: { name: string; path: string }[];
	twitterCard?: 'summary' | 'summary_large_image';
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
	breadcrumb,
	twitterCard = 'summary_large_image',
}) => {
	const router = useRouter();
	const trueMetaTitle =
		!metatitle ? 'Dragon Quest Synthesis'
		: fullMetatitle ? metatitle
		: `${metatitle} | Dragon Quest Synthesis`;
	const path = router.asPath.split(/[?#]/)[0];
	const localeUrl = (locale?: string, page = path) =>
		locale == 'fr' ? `${SITE_URL}/fr${page == '/' ? '' : page}` : `${SITE_URL}${page}`;
	const url = localeUrl(router.locale);
	const indexable = router.pathname != '/404';
	const image = /^https?:/.test(metaimg) ? metaimg : `${SITE_URL}/images/${metaimg}`;
	const description = metadescription || DEFAULT_DESCRIPTION;
	const breadcrumbJsonLd = breadcrumb && {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [{ name: 'Dragon Quest Synthesis', path: '/' }, ...breadcrumb].map(
			(item, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: item.name,
				item: localeUrl(router.locale, item.path),
			})
		),
	};
	return (
		<>
			<Head>
				<title>{trueMetaTitle}</title>
				<meta property="og:title" content={trueMetaTitle} />
				{indexable && <link rel="canonical" href={url} />}
				{indexable && <meta property="og:url" content={url} />}
				{indexable &&
					router.locales?.map(locale => (
						<link
							key={locale}
							rel="alternate"
							hrefLang={locale}
							href={localeUrl(locale)}
						/>
					))}
				{indexable && (
					<link rel="alternate" hrefLang="x-default" href={localeUrl('en')} />
				)}
				{/* here because refused from _document.tsx */}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="description" content={description} />
				<meta property="og:description" content={description} />
				<meta property="og:image" content={image} />
				<meta name="twitter:card" content={twitterCard} />
				<meta name="twitter:image" content={image} />
				{indexable && breadcrumbJsonLd && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
					/>
				)}
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
