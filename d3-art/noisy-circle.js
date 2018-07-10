const size = 500; // height and width
const radius = size / 2; // also the center
const noise = 10;

const interval = 10; // ms
const totalTime = 5 * 1000; // 5 seconds
const n = totalTime / interval; // number of points in polygon

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

const data = [];

const line = d3.line().x(d => d.x).y(d => d.y);
const path = svg
    .append('path')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

const slice = 2 * Math.PI / n;

const timer = d3.interval(t => {
    if (t > totalTime) {
        timer.stop();
    }

    const i = Math.floor(t / interval);
    const theta = slice * i;

    data.push({
        x: radius + rand() + Math.sin(theta) * radius / 2,
        y: radius + rand() - Math.cos(theta) * radius / 2,
    });

    path.attr('d', line(data));
}, interval);

function rand() {
    return Math.random() * noise;
}
