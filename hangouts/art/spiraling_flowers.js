/* Params */
// const width = 1500;
// const height = 1500;
const width = 500;
const height = 500;
// Spiral params
const start = 0;
const end = 2.25;
const numSpirals = 10;
// Flower sizes
const petalSize = 0.5;
// const halfRadius = 10;
const halfRadius = 4;
// Max number of petals
const maxWords = 25;
// Will modify opacity
const maxChars = 15;
// Remove short messages
const messageLengthThreshold = 2;
// Spacing along spiral
const noiseFactors = [
    width / 5,
    width / 10,
    width / 15,
    // width / 10,
    // width / 20,
    // width / 30,
    // width / 20,
    // width / 40,
    // width / 60,
];
// Whether or not to show messages containing "i love you"
const showLove = true;

/* Colors */

// Stroke color -- white makes it seem more crystalline
const stroke = 'none';

// Pink blue and yellow
const color1 = '#FF338D';
const color2 = '#338DFF';
const color3 = 'yellow';

// Yellow and lavender
// const color1 = '#ffe352';
// const color2 = '#8e59e3';

// // Lavender and red
// const color1 = '#8e59e3';
// const color2 = '#ce0f3d';
// const color3 = 'yellow';

// Yellow and blue
// const color1 = '#ffe352';
// const color2 = '#120A8F';
// const color3 = '#fff';

// Red and blue
// const color1 = '#ce0f3d';
// const color2 = '#120A8F';

// Buddhist colors - greenish brown, grey, reddish brown
// const color1 = '#66583e';
// const color2 = '#46443c';
// const color3 = '#8a3d24';

// Background color -- can't be in css or won't properly save to svg

// Dark purple
// const background = '#3a3973';
// Dark grey
// const background = '#20212b';
// Midnight blue
const background = '#0a0e33';
// Dark red
// const background = '#7b1515';
// Lavender
// const background = '#dab8f3';
// Dark ultramarine
// const background = '#150e6f';
// Light banana
// const background = '#f7e8d8';
// Light pinkish banana
// const background = '#f1ddd8';
// Buddhist light brown
// const background = '#98653d';

/* For drawing flowers */

function petalPath(d, size) {
    const angle = (d.endAngle - d.startAngle) / 2;
    const s = toCartesian(-angle, halfRadius);
    const e = toCartesian(angle, halfRadius);
    const r = size(d.data.size);
    const m = { x: halfRadius + r, y: 0 };
    const c1 = { x: halfRadius + r / 2, y: s.y };
    const c2 = { x: halfRadius + r / 2, y: e.y };
    return `M0,0L${s.x},${s.y}Q${c1.x},${c1.y} ${m.x},${m.y}L${m.x},${m.y}Q${c2.x},${c2.y} ${e.x},${e.y}Z`;
}
function petalFill(d) {
    if (showLove && d.data.isLove) {
        return color3;
    }
    return d.data.name.startsWith('M') ? color1 : color2
}
function flowerRadius(angle) {
    return `rotate(${angle / Math.PI * 180})`;
}
function toCartesian(angle, radius) {
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
    };
}

/* Placing flowers */

function noise() {
    const sign = Math.random() < 0.5 ? -1 : 1;
    const noiseFactor = Math.floor(Math.random() * noiseFactors.length);
    return Math.random() * noiseFactors[noiseFactor] * sign;
}
function messagePosition(i, scale, path) {
    const { x, y } = path.node().getPointAtLength(scale(i));
    return `translate(${x + noise()}, ${y + noise()})`;
}

/* For spiral */

function theta(r) {
    return numSpirals * Math.PI * r;
}

/* Formatting data */

function filterMessages(data) {
    return data.messages.filter(d => d.content.split(/\s+/).length > messageLengthThreshold);
}
function messageToData(d) {
    const words = d.content.split(/\s+/).slice(0, maxWords);
    return words.map(w => ({ size: petalSize, name: d.name, chars: w.length, isLove: containsLove(d.content) }));
}
function containsLove(message) {
    return message.toLowerCase().match(/i love you/) !== null;
}

async function draw() {
    // const data = await d3.json('messages_15-20.json');
    // const filtered = filterMessages(data);
    const data1 = await d3.json('../data/messages_0-100.json');
    const data2 = await d3.json('../data/messages_100-200.json');
    const data3 = await d3.json('../data/messages_200-300.json');
    const data4 = await d3.json('../data/messages_300-400.json');
    const filtered = filterMessages(data1)
        .concat(filterMessages(data2))
        .concat(filterMessages(data3))
        .concat(filterMessages(data4));

    // For placing flowers along spiral
    const radius = d3.scaleLinear()
        .domain([start, end])
        .range([40, d3.min([width, height]) / 2]);
    const spiral = d3.radialLine()
        .curve(d3.curveCardinal)
        .angle(theta)
        .radius(radius);
    const points = d3.range(start, end + 0.001, (end - start) / 1000);

    // For petals
    const pie = d3.pie().sort(null).value(d => d.size);
    const opacityScale = d3.scaleLinear().domain([1, maxChars]).range([0, 1]);
    const petalSize = d3.scaleSqrt().domain([0, 1]).range([0, halfRadius]);
    const loveScale = d3.scaleLinear().domain([1, maxChars]).range([0.6, 1]);

    const svg = d3.select('.container')
        .append('svg')
        .attr('width', width * 2)
        .attr('height', height * 2)
        .style('background', background)
        .append('g')
        .attr('transform', `translate(${width}, ${height})`);

    const path = svg
        .append('path')
        .datum(points)
        .attr('d', spiral)
        .attr('fill', 'none')
        .attr('stroke', 'none');

    const spiralLength = path.node().getTotalLength();
    const scale = d3.scaleLinear().domain([0, filtered.length - 1]).range([0, spiralLength]);

    const flowers = svg.selectAll('.flower')
        .data(filtered)
        .enter()
        .append('g')
        .attr('class', 'flower')
        .attr('transform', (d, i) => messagePosition(i, scale, path));
    
    flowers.selectAll('.petal')
        .data(d => pie(messageToData(d)))
        .enter()
        .append('path')
        .attr('class', 'petal')
        .attr('transform', d => flowerRadius((d.startAngle + d.endAngle) / 2))
        .attr('d', d => petalPath(d, petalSize))
        .attr('fill', petalFill)
        .attr('opacity', d => d.data.isLove ? loveScale(d.data.chars) : opacityScale(d.data.chars))
        .attr('stroke', stroke);
}

draw();