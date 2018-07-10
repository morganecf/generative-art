const size = 500;
const center = size / 2;
const duration = 2000;

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
    .attr('opacity', 0.9);
