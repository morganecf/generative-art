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
    .attr('fill', '#222')
    .attr('opacity', 0.8);

const lines = svg
    .selectAll('line')
    .data(d3.range(0, n))
    .enter()
    .append('line')
    .attr('stroke', '#000')
    .attr('stroke-width', 2)
    .attr('stroke-opacity', d => 1 / n * (n - rand()));

d3.timer(t => {
    // t = total elapsed time
    lines
        .attr('x1', radius)
        .attr('y1', radius)
        .attr('x2', d => x(d, t))
        .attr('y2', d => y(d, t));
});

/* liquid daisy */
function rand() {
    return Math.ceil(n * Math.random());
}
function r(d, t) {
    return radius / 1.5 * Math.sin(d * t / 50000);
}
function x(d, t) {
  const theta = 2 * Math.PI / n * d;
  return radius + Math.sin(theta) * r(d, t);
}
function y(d, t) {
  const theta = 2 * Math.PI / n * d;
  return radius - Math.cos(theta) * r(d, t);
}

/* Simple spiral */
// function x(d, t) {
//     // vary the length of each line
//     const r = d * radius * t / 100000;
//     const theta = (2 * Math.PI) / n * d;
//     return radius + Math.sin(theta) * r;
// }
// function y(d, t) {
//     const r = d * radius * t / 100000;
//     const theta = ((2 * Math.PI) / n) * d;
//     return radius - Math.cos(theta) * r;
// }
