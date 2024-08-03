const fs = require('fs');
const { JSDOM } = require('jsdom');

// to await
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function readJson(src) {
	const json = fs.readFileSync(src);
	if (!json) return null;
	const data = JSON.parse(json);
	return data;
}

function readHtml(url) {
	const html = fs.readFileSync(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		return data;
	});
	if (!html) return null;
	const dom = new JSDOM(html);
	return dom.window.document;
}

// to await
async function fetchHtml(url) {
	let response, html;
	response = await fetch(url);
	html = await response.text();

	const dom = new JSDOM(html);
	return dom.window.document;
}

function writeJson(filePath, body) {
	fs.writeFile(filePath, JSON.stringify(body, null, 4), 'utf8', function (err) {
		if (err) {
			console.error('An error occured while writing in ' + filePath);
			console.error(err);
		} else {
			console.log('Succesfully write in ' + filePath);
		}
	});
}

function capitalize(string, exceptions) {
	if (!string) return string;

	return string.toLowerCase().replace(/(\b[a-zA-ZÀ-ÿÉé]+)/g, string => {
		if (exceptions && exceptions.includes(string)) {
			return string;
		}
		if (string.length === 1) return string.toUpperCase();
		return string[0].toUpperCase() + string.slice(1);
	});
}

module.exports = { wait, capitalize, writeJson, readJson, fetchHtml, readHtml };
