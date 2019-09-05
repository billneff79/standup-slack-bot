

const fs = require('fs');
const path = require('path');
const marked = require('marky-markdown');
const mustache = require('mustache');

let cachedPage;

module.exports = function buildPage(botName) {
	if (cachedPage) return cachedPage;

	const sections = JSON.parse(fs.readFileSync(path.join(__dirname, '/sections.json')));
	let htmlContent = '';

	const indexTemplate = fs.readFileSync(path.join(__dirname, 'views/index.mustache'), { encoding: 'utf-8' });
	const sectionTemplate = fs.readFileSync(path.join(__dirname, 'views/section.mustache'), { encoding: 'utf-8' });

	for (let i = 0; i < sections.length; i++) {
		const section = sections[i];

		if (fs.existsSync(`./documentation/${section.markdown}`)) {
			let src = fs.readFileSync(`./documentation/${section.markdown}`, { encoding: 'utf-8' });
			if (src.trim().startsWith('#')) {
				const eol = src.indexOf('\n', src.indexOf('#'));
				src = src.substr(eol);
			}
			src = mustache.render(src, { bot_name: botName });
			const sectionContent = marked(src);

			htmlContent += mustache.render(sectionTemplate, { number: i, name: section.name, content: sectionContent });
		}
	}
	return cachedPage = mustache.render(indexTemplate, { baseURL: process.env.URL, content: htmlContent });
};
