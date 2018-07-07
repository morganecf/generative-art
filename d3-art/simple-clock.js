const size = 500; // height and width
const radius = size / 2; // also the center

const svg = d3
    .select('body')
    .append('svg')
    .attr('width', size)
    .attr('height', size);

svg
    .append('circle')
    .attr('r', radius)
    .attr('cx', radius)
    .attr('cy', radius)
    .attr('fill', '#111')
    .attr('opacity', 0.8);

const lines = svg
    .append('line')
    .attr('stroke', 'white')
    .attr('stroke-width', 4)
    .attr('x1', radius)
    .attr('y1', radius);

const inc = Math.PI * 2 / 500;
let counter = 0;
d3.timer(t => {
    const angle = inc * counter;

    lines
        .attr('x2', radius + Math.sin(angle) * radius)  // shift over to center
        .attr('y2', radius - Math.cos(angle) * radius); 
    counter += 1;
});
