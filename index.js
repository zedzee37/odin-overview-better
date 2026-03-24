let sections = [];
let search = undefined;
let results = undefined;
let currentSection = undefined;

async function main() {
	search = document.getElementById("search");
	results = document.getElementById("results");
	currentSection = document.getElementById("currentSection");

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
}

function parseArticle(article) {
	let sections = [];
	let currentSection = {
		text: "",
		elements: []
	};
	for (child of article.children) {
		if (child.tagName.toLowerCase()[0] == "h") {
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
		handleChildren(element);
		div.appendChild(element);
	}
	doc.appendChild(div);
}

function handleChildren(element) {
	for (const child of element.children) {
		handleChild(child);
		handleChildren(child);
	}
}	

function parseHRef(href) {
	if (href.startsWith("https://pkg.odin-lang.org")) {
		return "";
	}

	const length = href.length;
	let current = 0;
	while (current < length && href[current] !== "#") {
		current += 1;
	}
	return href.slice(current + 1);
}

function handleChild(child) {
	if (child.tagName.toLowerCase() == "a") {
		// try to find the most likely section this is pointing tko
		const href = parseHRef(child.href);
		child.href = "#";
		if (sections.length !== 0) {
			const sorted = sections.sort((a, b) => searchScore(href, b.name) - searchScore(href, a.name));
			resolveAnchor(child, sorted[0]);
		}
	}
}

function resolveAnchor(anchor, result) {
	anchor.href = "#";
	anchor.onmousedown = (event) => onClickSection(result, event);
}

function findFirstResult() {
	for (const result of results.children) {
		if (result !== undefined) {
			return result;
		}
	}
	return undefined;
}

function onSearch(event) {
	displayResults();
	if (results.children.length === 0) {
		return;
	}

	if (event.key == "Enter" || event.keyCode == 13) {
		const firstResult = findFirstResult();
		if (firstResult !== undefined) {
			findFirstResult().onmousedown(null);
			if (document.activeElement !== undefined) {
				document.activeElement.blur();
			}
		}
	}
}

function getLowerCharMap(s) {
	let charMap = {}
	for (let char of s) {
		const lowerChar = char.toLowerCase();
		let count = 0;
		if (lowerChar in charMap) {
			count = charMap[lowerChar];
		}
		count += 1;
		charMap[lowerChar] = count;
	}
	return charMap;
}

function searchScore(query, target) {
    query = query.toLowerCase();
    target = target.toLowerCase();
    
    if (query === target) return 100;
    if (target.includes(query)) return 80 + (query.length / target.length * 10);

    let score = 0;
    let targetIdx = 0;
    let matches = 0;

    for (let i = 0; i < query.length; i++) {
        const char = query[i];
        const foundIdx = target.indexOf(char, targetIdx);
        
        if (foundIdx !== -1) {
            matches++;
            if (foundIdx === targetIdx) score += 10; 
            targetIdx = foundIdx + 1;
        }
    }

    return (matches / query.length) * score;
}

function removeAllChildren(element) {
	while (element.firstChild) {
		element.removeChild(element.lastChild);
	}
}

function displayResults() {
	if (results === undefined) {
		return;
	}
	removeAllChildren(results);
	const text = search.value;
	const sorted = sections.sort((a, b) => searchScore(text, b.name) - searchScore(text, a.name));
	for (const result of sorted) {
		const anchor = document.createElement("a");
		anchor.className = "result";
		resolveAnchor(anchor, result);
		anchor.textContent = result.name;
		results.appendChild(anchor);
	}
}

function removeResults() {
	if (results === undefined || results.children.length === 0) {
		return;
	}
	
	if (results !== undefined) {
		removeAllChildren(results);
	}
}

function onSearchFocus(event) {
	displayResults();
}

function onSearchBlur(event) {
	setTimeout(() => {
		removeResults();
	}, 150);
}

function removeCurrentSection() {
	if (currentSection === undefined) {
		return;
	}
	removeAllChildren(currentSection);
}

function onClickSection(section, event) {
	if (currentSection !== undefined) {
		removeCurrentSection();
	}
	insertSection(currentSection, section.elements);
}

document.onkeyup = (event) => {
	const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

	if (event.key == "Enter" || event.keyCode === 13) {
		return;
	}

	if (document.activeElement == search) {
		return;
	}

	if (search !== undefined) {
		search.focus();
		search.value = "";
		
		if (ALPHABET.includes(event.key.toLowerCase())) {
			search.value = event.key;
		}
	}
}

main();

