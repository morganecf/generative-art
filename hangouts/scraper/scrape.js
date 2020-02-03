const fs = require('fs');
const puppeteer = require('puppeteer');

const args = process.argv;

LIMIT = 655;
PAGE_LIMIT = 100;

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate
    await page.goto('https://mail.google.com');
    await page.waitForSelector('input[type="email"]')
    
    // Enter email
    await page.type('input[type="email"]', args[2])
    await page.click('#identifierNext')

    // Enter password
    await page.waitForSelector('input[type="password"]', { visible: true })
    await page.type('input[type="password"]', args[3])
    await page.waitForSelector('#passwordNext', { visible: true })
    await page.click('#passwordNext')
    browser.pause();

    // Search for in:chat <email> (don't use from: so that all messages are formatted the same)
    // args[4]

    // await browser.close();
})();


function parseTimestamp(row) {
    return row.querySelector('.gH .g3').title;
}
function parseName(row) {
    return row.querySelector('.gF').innerText;
}
function parseContent(row) {
    const el = row.querySelector('.a3s');
    return el.textContent.split('\n').join(' ');
}
function parseRow(row) {
    const name = parseName(row);
    const timestamp = parseTimestamp(row);
    const content = parseContent(row);
    return { name, timestamp, content };
}
function expand() {
    return document.querySelector('table .adx').click();
}
function scrapeThread(messages) {
    const rows = document.querySelectorAll('.gs');
    for (let i = 0; i < rows.length; i++) {
        try {
            const parsed = parseRow(rows[i]);
            messages.push(parsed);
        } catch (err) {
            console.log('ERROR', err);
        }
    }
}
function clickNext() {
    const nextButton = document.querySelector('.T-I.J-J5-Ji.adg.T-I-awG.T-I-ax7.T-I-Js-Gs.L3');
    nextButton.click();
}
function save(filename, data, index) {
    const blob = new Blob([data], {type: 'text/json'});
    const event = document.createEvent('MouseEvents');
    const link = document.createElement('a');
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(e);
}
function scrapeThreads(messages, index) {
    if (index == PAGE_LIMIT) {
        console.log('********** SAVING **********');
        const start = index - PAGE_LIMIT;
        const filename = `messages_${start}-${index}`;
        const data = JSON.stringify({ messages }, undefined, 4);
        save(filename, data, index);
        messages = [];
    }
    if (index == LIMIT) {
        console.log('********** FINISHED **********');
        return;
    }
    expand();
    scrapeThread(messages);
    console.log(`Scraped thread ${index}: ${messages.length} messages total`);
    clickNext();
    setTimeout(() => {
        scrapeThreads(messages, index + 1);
    }, 3000)
}

messages = [];
scrapeThreads(messages, 0);
