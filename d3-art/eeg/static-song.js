const width = 500;
const height = 500;
const n = 40;
const r = width / n / 2;

// Use accel data to distort circles at position x,y -- where z is the radius

const colors = [
    'white',
    'red',
    'blue',
    'cyan',
    'violet',
    'yellow',
];

const grid = d3.range(n * n);
const data = eeg_sample_data.accelerometer;

const yscale = d3
    .scaleLinear()
    .domain(extent('y'))
    .range([0, n]);
const xscale = d3
    .scaleLinear()
    .domain(extent('x'))
    .range([0, n]);
const rscale = d3
    .scaleLinear()
    .domain(extent('z'))
    .range([0, r]);

const svg = d3
    .select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#333');

const circles = svg
    .selectAll('circle')
    .data(grid)
    .enter()
    .append('circle')
    .attr('id', d => `point-${d}`)
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', r)
    .attr('fill', '#fff')
    .attr('opacity', 0.4);

function cx(d) {
    return r + Math.floor(d / n) * width / n;
}
function cy(d) {
    return r + d % n * height / n;
}
function extent(axis) {
    return [
        d3.min(data, d => d3.min(d.samples, s => s[axis])),
        d3.max(data, d => d3.max(d.samples, s => s[axis])),
    ];
}
function getScaledData(d) {
    const x = Math.round(xscale(d.samples[0].x));
    const y = Math.round(yscale(d.samples[0].y));
    const r = rscale(d.samples[0].z);
    return [ grid[x * y], r ];
}

data.forEach(d => {
    const scaled = getScaledData(d);
    d3
        .select(`#point-${scaled[0]}`)
        .interrupt()
        .transition()
        .duration(2000)
        .attr('r', scaled[1]);
}); 
