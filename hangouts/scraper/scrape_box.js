/* Scrapes a page from the hangout box. Unfortunately box is in an iframe
so this is not the ideal way to automate it. */

const metadataRegex = /\[(?<date>.+)\] (?<name>[A-Za-z]+)/g;

function parseMetadata(text) {
    const matches = [...text.matchAll(metadataRegex)];
    return [matches[0][1], matches[0][2]];
}
function parseContent(text) {
    return text.split('\n').join(' ');
}
function parseMessage(el) {
    const spans = el.getElementsByTagName('span');
    const [ timestamp, name ] = parseMetadata(spans[0].innerText);
    const content = parseContent(spans[1].innerText);
    return { name, timestamp, content };
}
function scrapePage() {
    // Returns iterator
    const messages = document.getElementsByClassName('Mu');
    const formatted = [];
    for (let i = 0; i < messages.length; i++) {
        formatted.push(parseMessage(messages[i]));
    }
    return formatted;
}

