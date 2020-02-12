/*
This plots sequence of sample data for one day.
    x = order in sequence
    y = sequence of points, each representing word
    opacity = number of chars in word
*/

const width = 900;
const height = 600;
const pad = 50;

const color1 = '#ffe352';
// const color2 = '#30bac7';
const color2 = '#6fc730';

async function draw() {
    let data = await d3.json('messages_15-20.json');
    data = data.messages;

    // const maxChars = d3.max(data, d => d.content.length);
    const maxChars = 30;
    const maxWords = d3.max(data, d => d.content.split(/\s+/).length);

    const svg = d3.select('.container')
        .append('svg')
        .attr('width', width + pad)
        .attr('height', height + pad);

    const xscale = d3.scaleLinear().domain([0, data.length - 1]).range([pad, width]);
    const yscale = d3.scaleLinear().domain([0, maxWords]).range([height, pad]);
    const opacityScale = d3.scaleLinear().domain([1, maxChars]).range([0, 1]);

    const messages = svg.selectAll('.message')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'message')
        .attr('fill', d => d.name.startsWith('M') ? color1 : color2)
        .attr('transform', (d, i) => `translate(${xscale(i)}, 0)`);

    messages.selectAll('.word')
        .data(d => d.content.split(/\s+/))
        .enter()
        .append('circle')
        .attr('class', 'word')
        .attr('cy', (d, i) => yscale(i))
        .attr('cx', 0)
        // .attr('fill', 'black')  // this is also pretty but doesn't distinguish between interlocutors
        .attr('r', 5)
        .attr('opacity', d => opacityScale(d.length));   // chars in word
}

draw()
