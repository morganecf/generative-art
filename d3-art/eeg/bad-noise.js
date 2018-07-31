const width = 500;
const height = 500;

const electrodes = 4 * 5; // repeat 4 electrodes 5 times
const samples = 12;
const maxStroke = 5;

const colors = [
    'white',
    'red',
    'blue',
    'cyan',
    'violet',
    'yellow',
];

const strokeScale = d3
    .scaleLinear()
    .domain([-200, 200])
    .range([0, maxStroke]);

const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#000')
    .attr('shape-rendering', 'crispEdges');

// Rows and columns
const data = d3.range(electrodes).map(y => d3.range(samples).map(x => ({x, y: y % 4})));

const g = svg
    .selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0,${(i * height / electrodes + 0.5)})`);

const lines = g
    .selectAll('line')
    .data(d => d)
    .enter()
    .append('line')
    .attr('x1', d => d.x * width / samples)
    .attr('y0', 0)
    .attr('x2', d => (d.x + 1) * width / samples)
    .attr('y1', 0)
    .attr('stroke', '#fff');

let i = 0;
d3.timer(t => {
    const reading = eeg_sample_data.eeg[i % eeg_sample_data.eeg.length];

    lines
        .filter((d, j) => Math.random() * (j + 1) > Math.random() * i % eeg_sample_data.eeg.length) 
        .attr('stroke', d => stroke(d, reading))
        .attr('stroke-width', d => strokeWidth(d, t, reading));

    i += 1;
});

function stroke(d, reading) {
    return colors[d.x % colors.length];
}
function strokeWidth(d, t, reading) {
    const sample = reading.samples[d.y];
    return strokeScale(sample);
}


// /*
//     4 electrodes * 12 samples = 48 lines
    
//     Lines start off as point in the middle (overall mean)
//     Line length = function of distance from mean 
//     Line stroke = function of time
//     Line color = electrode (flash)
// */

// const width = 500;
// const height = 500;
// const center = width / 2;
// const colors = [
//     ['white', 'red'],
//     ['green', 'blue'],
//     ['cyan', 'violet'],
//     ['white', 'violet'],
// ];
// const maxStroke = 5;

// const electrodes = {};
// eeg_sample_data.eeg.forEach(d => {
//     if (electrodes[d.electrode]) {
//         electrodes[d.electrode].push(d.samples);
//     } else {
//         electrodes[d.electrode] = [d.samples];
//     }
// });

// const numReadings = d3.min(Object.values(electrodes), d => d.length);

// // const mean = d3.mean(eeg_sample_data.eeg, d => d3.mean(d.samples));
// const extent = [
//   d3.min(eeg_sample_data.eeg, d => d3.min(d.samples)),
//   d3.max(eeg_sample_data.eeg, d => d3.max(d.samples))
// ];

// // Map from reading to px
// const scale = d3
//   .scaleLinear()
//   .domain(extent)
//   .range([0, width]);

// // Map from phase shift to reading
// const readingScale = d3
//     .scaleLinear()
//     .domain([-1, 1])
//     .range([0, numReadings]);

// const svg = d3
//     .select('body')
//     .append('svg')
//     .attr('width', width)
//     .attr('height', height)
//     .style('background', '#000')
//     .attr('transform', 'translate(50, 50)');

// const lines = svg
//     .selectAll('line')
//     .data(d3.range(4 * 12))
//     .enter()
//     .append('line');

// d3.timer(t => {
//     lines
//         .attr('x1', d => x1(d, t))
//         .attr('y1', d => y(d, t))
//         .attr('x2', d => x2(d, t))
//         .attr('y2', d => y(d, t))
//         .attr('stroke', d => stroke(d))
//         .attr('stroke-width', d => strokeWidth(d, t));
// });

// console.log(electrodes);

// function getReading(t) {
//   // Map from time elapsed to particular reading (to repeat eeg recording)
//   // Math.sin(t / 1000) is about - 1 to 1
//   return Math.round(readingScale(Math.sin(t / 2500)));
// }
// function getSamples(d, t) {
//     const i = getReading(t);
//     const electrode = Math.floor(d % 4);
//     return electrodes[electrode][i];
// }
// // function getLength(d, t) {
// //     const samples = getSamples(d, t);
// //     const sample = samples[d % 12];
// //     // Unique center for each electrode/sample combination
// //     const mean = d3.mean(samples);
// // }
// function x1(d, t) {
//     const samples = getSamples(d, t);
//     const sample = samples[d % 12];
//     // return scale(sample);
//     return 0;
// }
// function x2(d, t) {
//     const samples = getSamples(d, t);
//     const mean = d3.mean(samples);
//     // return scale(mean);
//     return width;
// }
// function y(d) {
//     return d * (height / 48);
// }
// function stroke(d, t) {
//     const electrode = Math.floor(d % 4);
//     const pair = colors[electrode];
//     const i = d / 3 - electrode > 0.5 ? 0 : 1;
//     return pair[i];
// }
// function strokeWidth(d, t) {
//     return 2;
// }