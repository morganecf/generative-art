/*
    Pieces:
    1. Quicksilver Eye
    2. Bisexual Squares
    3. Static Song
    4. To Hell With It, I Just Want A Graph
*/

const width = 1500;
const height = 200;

const data = eeg_sample_data.eeg;

const svg = d3
    .select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('transform', 'translate(20, 20)')
    .style('background', '#f5f5f5');

const min = d => d3.min(d.samples);
const max = d => d3.max(d.samples);
const x = d => new Date(d.timestamp);

const xextent = d3.extent(data, x);
const yextent = [
    d3.min(data, min),
    d3.max(data, max),
];

const yscale = d3
    .scaleTime()
    .domain(yextent)
    .range([height, 0]);
const xscale = d3
    .scaleLinear()
    .domain(xextent)
    .range([0,  width]);

const line = d3.line().x(d => xscale(x(d))).y(d => yscale(max(d)));

function drawLine(electrode, color) {
    svg
        .append('path')
        .attr('d', line(data.filter(d => d.electrode === electrode)))
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', color);
}

drawLine(0, 'blue');
drawLine(1, 'green');
drawLine(2, 'purple');
drawLine(3, 'red');

const kernel = normaliseKernel([0.1, 0.2, 0.3, 0.2, 0.1]);
const smoothed = convolute(data, kernel, d => d3.mean(d.samples));
console.log(smoothed);

function convolute(data, kernel, accessor) {
  var kernel_center = Math.floor(kernel.length / 2);
  var left_size = kernel_center;
  var right_size = kernel.length - (kernel_center - 1);
  if (accessor == undefined) {
    accessor = function(datum) {
      return datum;
    };
  }
  function constrain(i, range) {
    if (i < range[0]) {
      i = 0;
    }
    if (i > range[1]) {
      i = range[1];
    }
    return i;
  }
  var convoluted_data = data.map(function(d, i) {
    var s = 0;
    for (var k = 0; k < kernel.length; k++) {
      var index = constrain(i + (k - kernel_center), [0, data.length - 1]);
      s += kernel[k] * accessor(data[index]);
    }
    return s;
  });
  return convoluted_data;
}

function normaliseKernel(a) {
  function arraySum(a) {
    var s = 0;
    for (var i = 0; i < a.length; i++) {
      s += a[i];
    }
    return s;
  }
  var sum_a = arraySum(a);
  var scale_factor = sum_a / 1;
  a = a.map(function(d) {
    return d / scale_factor;
  });
  return a;
}