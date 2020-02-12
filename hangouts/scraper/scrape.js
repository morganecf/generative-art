/*
1. in:chats <email>
2. click on first thread
3. run script
*/

LIMIT = 655;
PAGE_LIMIT = 100;
// LIMIT = 20;
// PAGE_LIMIT = 5;
TIMEOUT = 8000;

function sleep(ms) {
    return new Promise(response => setTimeout(response, ms));
}
function parseTimestamp(row) {
    return row.querySelector('.gH .g3').title;
}
function parseName(row) {
    return row.querySelector('.gF').textContent;
}
function parseContent(row) {
    let el = row.querySelector('.a3s');
    if (el == null) {
        el = row.querySelector('.iA.g6');
    }
    return el.textContent.split('\n').join(' ');
}
function parseRow(row) {
    const name = parseName(row);
    const timestamp = parseTimestamp(row);
    const content = parseContent(row);
    return { name, timestamp, content };
}
function scrapeThread(messages) {
    const rows = document.querySelectorAll('.G3.G2');
    for (let i = 0; i < rows.length; i++) {
        try {
            const parsed = parseRow(rows[i]);
            messages.push(parsed);
        } catch (err) {
            console.log('ERROR', err);
        }
    }
}
async function expand() {
    const compressed = document.querySelector('table .adx');
    if (compressed) {
        compressed.click();
        await sleep(TIMEOUT);
    }
}
async function clickNext() {
    const nextButton = document.querySelector('.T-I.J-J5-Ji.adg.T-I-awG.T-I-ax7.T-I-Js-Gs.L3');
    nextButton.click();
    await sleep(TIMEOUT)
}
function save(messages, index) {
    const start = index - PAGE_LIMIT;
    const filename = `messages_${start}-${index}.json`;
    const data = JSON.stringify({ messages }, undefined, 4);
    const blob = new Blob([data], {type: 'text/json'});
    const event = document.createEvent('MouseEvents');
    const link = document.createElement('a');
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl =  ['text/json', link.download, link.href].join(':');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(event);
}
async function scrapeThreads(messages, index) {
    if (index > 0 && index % PAGE_LIMIT == 0) {
        console.log('********** SAVING **********');
        save(messages, index);
        messages = [];
    } else if (index > LIMIT) {
        console.log('********** FINISHED **********');
        save(messages, index);
        return;
    }
    await expand();
    scrapeThread(messages);
    console.log(`Scraped thread ${index}: ${messages.length} messages total`);
    await clickNext();
    scrapeThreads(messages, index + 1);
}

messages = [];
scrapeThreads(messages, 0);
