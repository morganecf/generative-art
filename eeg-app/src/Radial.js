import * as d3 from 'd3';
import Visualization from './Visualization';

const kernel = normaliseKernel([0.1, 0.2, 0.3, 0.2, 0.1]);

export default class Radial extends Visualization {
    constructor(options) {
        super(options);

        this.color = options.color;
        this.electrodes = options.electrodes;

        this.min = d => d3.min(d.samples);
        this.max = d => d3.max(d.samples);

        this.yscale = d3
            .scaleTime()
            .range([this.height / 2, 0]);
        this.xscale = d3
            .scaleLinear()
            .range([0, this.width / 2]);

        this.line = d3
            .lineRadial()
            .angle(this.angle.bind(this))    // equivalent to x
            .radius(this.radius.bind(this))  // equivalent to y
            // .curve(d3.curveMonotoneY); // curveMonotoneX/Y and curveNatural look good
            .curve(d3.curveNatural);

        // this.y = d => this.yscale(d3.mean(d.samples));
        this.y = d => this.yscale(d.smoothed);
    }

    radius(d) {
        return Math.sqrt(this.xscale(d.timestamp) ** 2, this.y(d) ** 2) / 2;
    }
    angle(d) {
        return Math.PI * 2 * Math.atan(this.y(d) / this.xscale(d.timestamp));
    }

    draw(data) {
        const xextent = d3.extent(data, d => d.timestamp);
        const yextent = [
            d3.min(data, this.min),
            d3.max(data, this.max),
        ];

        this.xscale.domain(xextent);
        this.yscale.domain(yextent);

        const electrodeData = data.filter(d => this.electrodes.indexOf(d.electrode) >= 0);

        convolute(electrodeData, kernel, d =>
            d3.mean(d.samples)
        ).forEach((d, i) => { electrodeData[i].smoothed = d + noise(); });

        d3.range(100).forEach(() => {
            this.svg
                .append('path')
                .attr('d', this.line(electrodeData))
                .attr('fill', 'none')
                .attr('stroke-width', 1)
                .attr('stroke', this.color)
                .attr('opacity', 0.9)
                .attr('transform', `translate(${this.width / 2},${this.height / 2})`);
        });
    }
}

function noise() {
    const dir = Math.random() > 0.3 ? -1 : (Math.random() > 0.5 ? 1 : -1);
    return dir * Math.random() * 5;
}

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
