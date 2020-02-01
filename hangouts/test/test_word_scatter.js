/*
This plots sequence of sample data for one day.
    x = order in sequence
    y = sequence of points, each representing word
    opacity = number of chars in word
*/

const width = 800;
const height = 600;
const pad = 50;

// number of words in longest message
const maxWords = 60;

// number of chars in longest word
const maxChars = 40;

function flatten(data) {
    const messages = [];
    data.forEach(d => {
        d.messages.forEach(message => {
            messages.push({
                name: d.name,
                message,
            });
        });
    });
    return messages;
}

async function draw() {
    const data = await d3.json('sample_data.json');
    const flattened = flatten(data);

    const svg = d3.select('.container')
        .append('svg')
        .attr('width', width + pad)
        .attr('height', height + pad);

    const xscale = d3.scaleLinear().domain([0, flattened.length - 1]).range([pad, width]);
    const yscale = d3.scaleLinear().domain([0, maxWords]).range([height, pad]);
    const opacityScale = d3.scaleLinear().domain([0, maxChars]).range([0, 1]);

    const messages = svg.selectAll('.message')
        .data(flattened)
        .enter()
        .append('g')
        .attr('class', 'message')
        .attr('transform', (d, i) => `translate(${xscale(i)}, 0)`);

    messages.selectAll('.word')
        .data(d => d.message.split(' '))
        .enter()
        .append('circle')
        .attr('class', 'word')
        .attr('cy', (d, i) => yscale(i))
        .attr('cx', 0)
        .attr('fill', 'black')
        .attr('r', 6)
        .attr('opacity', d => opacityScale(d.length));   // chars in word
}

draw()
