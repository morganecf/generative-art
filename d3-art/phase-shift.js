const n = 200; // number of lines
const size = 500; // height and width

const svg = d3
    .select('body')
    .append('svg')
    .attr('width', size)
    .attr('height', size);

const paths = svg
    .selectAll('path')
    .data(d3.range(0, n))
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', '#000')
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.4);

d3.timer(t => {
    paths.attr('d', d => {
        const angle = d * Math.PI * 2 / n;
        const r0 = size / 2 * Math.sin(d * t / 500 / n)
        const r1 = size / 2 * Math.cos(d * t / 500 / n) / 4;

        return 'M' + [r0 * Math.cos(angle), r0 * Math.sin(angle)] +
            'L' + [r1 * Math.cos(angle), r1 * Math.sin(angle)];
    });
});
