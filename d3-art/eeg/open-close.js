const width = 500;
const height = 500;
const rectSize = width / 2;
const opacity = 0.01;  // 0.01 - 0.02 is ideal
const n = 120; // 80 - 150 is ideal
const slowFactor = 1500;
// dark against dark - looks good with reading as phase shift input
const colors = ["#0a0ad6", "#d60acf", "#d60a0a"];
// const colors = [
//     '#fff',
//     '#c0dfed',
//     '#54b4ff',
//     '#bdb7ff',
// ];  // light against dark

const extent = [
    d3.min(eeg_sample_data.eeg, d => d3.min(d.samples)),
    d3.max(eeg_sample_data.eeg, d => d3.max(d.samples)),
];
const scale = d3
    .scaleLinear()
    .domain(extent)
    .range([0, n]);
const data = eeg_sample_data.eeg.map(d => ({
    electrode: d.electrode,
    reading: scale(d3.max(d.samples)), // min/max look a bit more eye-like? mean smooths it out?
})).slice(0, n);

const svg = d3
    .select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#d1d1d1')
    // .style('background', '#1c1b1b')
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);
const paths = svg
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('fill', 'none')
    // .attr('stroke', '#fff')
    .attr('stroke', '#111')
    // .attr('stroke', d => colors[d.electrode]) // Color as function of electrode (position on head)
    .attr('stroke-width', rectSize)
    .attr('stroke-opacity', opacity);

d3.timer(t => {
    paths
        .attr('d', (d, i) => {
            // Angle (phase shift): as function of index is more phasic (i.e. looks like circle)
            // As function of eeg reading is more static/rectangular
            const a = i * Math.PI * 2 / n;
            // Length of lines
            const r0 = width / 2 * Math.sin(d.reading * t / slowFactor / n);
            const r1 = width / 2 * Math.cos(d.reading * t / slowFactor / n) / 4;
            return `M${r0 * Math.cos(a)},${r0 * Math.sin(a)} L ${r1 * Math.cos(a)},${r1 * Math.sin(a)}`;
        });
        // .attr()
});
