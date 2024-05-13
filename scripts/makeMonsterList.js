// 1. Visit the Category:Families page

const { fetchHtml, writeJson, wait, readJson } = require('./lib');

// Replace this URL with the actual page URL
const root = 'https://dragonquest.fandom.com';
const baseUrl = root + '/wiki/Category:Families';
const dst = './src/json/monsterList.json';

// TODO prefill with existing data
const monsters = readJson(dst);
// Call the function to start scraping
// scrapeCategories();
updateFamily(
	'??? Family',
	'https://dragonquest.fandom.com/wiki/Category:%3F%3F%3F_family'
);

// Function to scrape category links starting with "Category:"
async function scrapeCategories() {
	const doc = await fetchHtml(baseUrl);
	if (doc == null) return;

	// Select all category links
	const categoryLinks = Array.from(doc.querySelectorAll('.category-page__member-link'));

	// Filter out links starting with "Category:"
	const categoryFamiliesUrl = categoryLinks
		.filter(
			link =>
				link.textContent.startsWith('Category:') && link.href.endsWith('_family')
		)
		.map(link => [
			link.textContent.replace('Category:', '').replace('_family', ''),
			root + link.href,
		]);

	console.log(categoryFamiliesUrl);

	try {
		for (let [name, url] of categoryFamiliesUrl) {
			await scrapeFamily(name, url);
			await wait(1000);
		}
	} catch (e) {
		console.log(e);
	}
	writeJson(dst, monsters);
}

async function updateFamily(name, url) {
	try {
		await scrapeFamily(name, url);
		writeJson(dst, monsters);
	} catch (e) {
		console.log(e);
	}
}

// Function to scrape family page
async function scrapeFamily(name, url) {
	const doc = await fetchHtml(url);
	// Select all family links
	const monstersLink = Array.from(doc.querySelectorAll('.category-page__member-link'));

	console.log(monstersLink.map(link => link.textContent));

	// Filter out links starting with "Category:"
	monstersLink.forEach(
		link =>
			(monsters[name][link.textContent.replace(/\s*\([^)]*\)\s*/g, '')] =
				root + link.href)
	);

	const nextPage = doc.querySelector('.category-page__pagination-next');
	if (nextPage != null) {
		console.log(nextPage.href);
		const nextUrl = nextPage.href;
		await wait(1000);
		await scrapeFamily(name, nextUrl);
	}
}
