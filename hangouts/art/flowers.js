// Size of frame
const width = 800;
const height = 800;
const pad = 50;
// Flower sizes
const petalSize = 0.5;
const halfRadius = 20;
// Max number of petals
const maxWords = 25;
// Will modify opacity
const maxChars = 10;
// Spacing
const noiseFactors = [
  width / 2,
  width / 3,
  width / 4,
  width / 5,
];
// Remove short messages
const messageLengthThreshold = 2;

// Yellow and green
// const color1 = '#ffe352';
// const color2 = '#6fc730';

// Purple and blue
// const color1 = '#7c1c9c';
// const color2 = '#30bac7';

// Lavender and red
// const color1 = '#8e59e3';
// const color2 = '#ce0f3d';

// Pink and red
// const color1 = '#ea7ad7';
// const color2 = '#ce0f3d';

// Yellow and lavender
const color1 = '#ffe352';
const color2 = '#8e59e3';

function petalPath(d) {
  const size = d3.scaleSqrt()
    .domain([0, 1])
    .range([0, halfRadius]);
  const angle = (d.endAngle - d.startAngle) / 2;
  const s = polarToCartesian(-angle, halfRadius);
  const e = polarToCartesian(angle, halfRadius);
  const r = size(d.data.size);
  const m = { x: halfRadius + r, y: 0 };
  const c1 = { x: halfRadius + r / 2, y: s.y };
  const c2 = { x: halfRadius + r / 2, y: e.y };
  return `M0,0L${s.x},${s.y}Q${c1.x},${c1.y} ${m.x},${m.y}L${m.x},${m.y}Q${c2.x},${c2.y} ${e.x},${e.y}Z`;
}

function petalFill(d) {
  return d.data.name.startsWith('M') ? color1 : color2
}

function radius(angle) {
  return `rotate(${angle / Math.PI * 180})`;
}

function polarToCartesian(angle, radius) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

function messageToData(d) {
  const words = d.content.split(/\s+/).slice(0, maxWords);
  return words.map(w => ({ size: petalSize, name: d.name, chars: w.length }));
}

function noise() {
  const sign = Math.random() < 0.5 ? -1 : 1;
  const noiseFactor = Math.floor(Math.random() * noiseFactors.length);
  return Math.random() * noiseFactors[noiseFactor] * sign;
}

function messagePosition(i, scale) {
  const x = scale(i) + noise();
  const y = scale(i);
  return `translate(${x}, ${y})`;
}

async function draw() {
  // const data = await d3.json('../data/messages_0-100.json');
  const data = await d3.json('messages_15-20.json');
  const filtered = data.messages.filter(d => d.content.split(/\s+/).length > messageLengthThreshold);

  const pie = d3.pie().sort(null).value(d => d.size);
  const xscale = d3.scaleLinear().domain([0, filtered.length - 1]).range([pad, width]);
  const opacityScale = d3.scaleLinear().domain([1, maxChars]).range([0.3, 1]);

  const svg = d3.select('.container')
    .append('svg')
    .attr('width', width * 2)
    .attr('height', height * 2);  

  const flowers = svg.selectAll('.flower')
    .data(filtered)
    .enter()
    .append('g')
    .attr('class', 'flower')
    .attr('transform', (d, i) => messagePosition(i, xscale));
  
  flowers.selectAll('.petal')
    .data(d => pie(messageToData(d)))
    .enter()
    .append('path')
    .attr('class', 'petal')
    .attr('transform', d => radius((d.startAngle + d.endAngle) / 2))
    .attr('d', petalPath)
    .attr('fill', petalFill)
    .attr('opacity', d => opacityScale(d.data.chars))
    // .attr('stroke', '#fff');
}

draw();