const n = 300; // number of lines
const size = 500; // height and width
const radius = size / 2; // also the center

const svg = d3
    .select('body')
    .append('svg')
    .attr('width', size)
    .attr('height', size)
    .attr('transform', 'translate(20, 20)');

svg
    .append('rect')
    .attr('width', size)
    .attr('height', size)
    .attr('fill', '#111')
    .attr('opacity', 0.8);

const line = d3.line();


