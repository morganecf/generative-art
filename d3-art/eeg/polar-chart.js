const width = 1000;
const height = 1000;

const data = eeg_sample_data.eeg.slice(
    eeg_sample_data.eeg.length / 3,
    2 * eeg_sample_data.eeg.length / 3
);

const kernel = normaliseKernel([0.1, 0.2, 0.3, 0.2, 0.1]);

const svg = d3
    .select('body')
    .append('svg')
    .attr('width', width + 10)
    .attr('height', height + 10)
    .attr('transform', 'translate(20, 20)')
    .style('background', '#f5f5f5');
    // .style('background', '#222');

const min = d => d3.min(d.samples);
const max = d => d3.max(d.samples);

// const y = d => yscale(d3.mean(d.samples));
const y = d => yscale(d.smoothed);

const xextent = d3.extent(data, d => d.timestamp);
const yextent = [
    d3.min(data, min),
    d3.max(data, max),
];

const yscale = d3
    .scaleTime()
    .domain(yextent)
    .range([height / 2, 0]);
const xscale = d3
    .scaleLinear()
    .domain(xextent)
    .range([0, width / 2]);

const line = d3
    .lineRadial()
    .angle(angle)    // equivalent to x
    .radius(radius)  // equivalent to y
    // .curve(d3.curveMonotoneY); // curveMonotoneX/Y and curveNatural look good
    .curve(d3.curveNatural);

function radius(d) {
    return Math.sqrt(xscale(d.timestamp) ** 2, y(d) ** 2) / 2;
}
function angle(d) {
    return Math.PI * 2 * Math.atan(y(d) / xscale(d.timestamp));
}
function noise() {
    const dir = Math.random() > 0.3 ? -1 : (Math.random() > 0.5 ? 1 : -1);
    return dir * Math.random() * 5;
}

function drawLine(electrode, color) {
    const electrodeData = data.filter(d => d.electrode === electrode);
    convolute(electrodeData, kernel, d =>
      d3.mean(d.samples)
    ).forEach((d, i) => { electrodeData[i].smoothed = d + noise(); });

    svg
        .append('path')
        .attr('d', line(electrodeData))
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', color)
        .attr('opacity', 0.9)
        .attr('transform', `translate(${width / 2},${height / 2})`);
}

// drawLine(0, '#000');
// drawLine(1, "#001c49"); // Electrode AF7 (above left eye)
// drawLine(2, '#001c49');
// drawLine(3, '#999');

d3.range(100).forEach(() => {
    // drawLine(1, "#8e050e");
    drawLine(1, "#001c49");
});

// From http://bl.ocks.org/tomgp/6770520
function convolute(data, kernel, accessor) {
    var kernel_center = Math.floor(kernel.length / 2);
    var left_size = kernel_center;
    var right_size = kernel.length - (kernel_center - 1);
    if (accessor == undefined) {
        accessor = function (datum) {
            return datum;
        }
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
    var convoluted_data = data.map(function (d, i) {
        var s = 0;
        for (var k = 0; k < kernel.length; k++) {
            var index = constrain((i + (k - kernel_center)), [0, data.length - 1]);
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
    a = a.map(function (d) {
        return d / scale_factor;
    })
    return a;
}
