/*
This just plots sequence of sample data for one day.
    x = order in sequence
    y = number of words in message
    opacity = number of chars in message
*/

const width = 800;
const height = 600;
const pad = 50;

// based on longest message
const maxChars = 330;
const maxWords = 60;

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

    svg.selectAll('.point')
        .data(flattened)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', (d, i) => xscale(i))
        .attr('cy', d => yscale(d.message.split(' ').length))
        .attr('r', 2)
        .attr('fill', 'black')
        .attr('opacity', d => opacityScale(d.message.length));
        
}

draw()
