let sections = [];
let search = undefined;
let results = [];

async function main() {
	search = document.getElementById("search");

	const response = await fetch("https://odin-lang.org/docs/overview/");
	const html = await response.text();
	const element = document.createElement("html");
	element.innerHTML = html;
	const articles = element.getElementsByClassName("odin-article");
	if (articles.length == 0) {
		return;
	}

	sections = parseArticle(articles[0]);
	const main = document.getElementsByTagName("main")[0];
	
	for (const section of sections) {
		insertSection(main, section.elements);
	}
}

function parseArticle(article) {
	let sections = [];
	let currentSection = {
		text: "",
		elements: []
	};
	for (child of article.children) {
		if (child.tagName.toLowerCase() == "h2") {
			if (currentSection.name !== undefined && currentSection.name != "") {
				sections.push(currentSection);
			}
			currentSection = {
				name: child.textContent,
				elements: []
			}
		}

		currentSection.elements.push(child);
	}
	sections.push(currentSection);
	return sections;
}

function insertSection(doc, section) {
	let div = document.createElement("div");
	for (const element of section) {
		handleChild(element);
		div.appendChild(element);
	}
	doc.appendChild(div);
	return div;
}

function handleChild(child) {
	// TODO: handle anchors and such
}

function onSearch(event) {
	displayResults();
	if (event.key == "Enter" || event.keyCode == 13) {
		// TODO: handle searching here
	}
}

function getCharMap(s) {
	let charMap = {}
	for (let char of s) {
		let count = 0;
		if (char in charMap) {
			count = charMap[char];
		}
		count += 1;
		charMap[char] = count;
	}
	return charMap;
}

function searchScore(s1, s2) {
	let charMap1 = getCharMap(s1);
	let charMap2 = getCharMap(s2);
	let score = 0;
	for (const char in charMap1) {
		const count = charMap1[char];
		if (!(char in charMap2)) {
			score -= count;
			continue;
		}

		let otherCount = charMap2[char];
		let penalty = Math.abs(count - otherCount);
		score += count + penalty;
	}

	return score;
}

function displayResults() {
	results = [];
	const text = search.value;
	let sorted = sections.sort((a, b) => searchScore(text, a.name) < searchScore(text, b.name));
	for (result of sorted) {
	}
}

function removeResults() {
	if (results.length === 0) {
		return;
	}
}

function onSearchFocus(event) {
	displayResults();
}

function onSearchBlur(event) {
	removeResults();
}

main();

