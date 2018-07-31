import * as d3 from 'd3';
import Visualization from './Visualization';

export default class Timeseries extends Visualization {
    constructor(options) {
        super(options);

        this.dx = 40;

        this.min = d => d3.min(d.samples);
        this.max = d => d3.max(d.samples);
        this.x = d => new Date(d.timestamp);

        this.yscale = d3
            .scaleLinear()
            .range([this.height, 0]);
        this.xscale = d3
            .scaleTime()
            .range([0, this.width - this.dx]);

        this.line = d3
            .line()
            .x(d => this.xscale(this.x(d)))
            .y(d => this.yscale(this.max(d)));
        
        this.xaxis = d3.axisBottom().scale(this.xscale);
        this.yaxis = d3.axisLeft().scale(this.yscale);
    }

    initScales() {
        const xextent = d3.extent(this.data, this.x);
        const yextent = [
            d3.min(this.data, this.min),
            d3.max(this.data, this.max),
        ];
        this.yscale.domain(yextent);
        this.xscale.domain(xextent);

        this.svg
            .append('g')
            .attr('transform', `translate(${this.dx}, ${this.height})`)
            .call(this.xaxis);
        this.svg
            .append('g')
            .attr('transform', `translate(${this.dx}, 0)`)
            .call(this.yaxis);
    }

    drawLine(electrode, color) {
        this.svg
            .append('path')
            .attr('d', this.line(this.data.filter(d => d.electrode === electrode)))
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke', color)
            .attr('opacity', 0.8)
            .attr('transform', `translate(${this.dx}, 0)`);
    }

    draw(data) {
        // Kinda hacky
        this.svg
            .attr('width', this.width + this.dx)
            .attr('height', this.height + 50)
            .attr('transform', 'translate(0, 100)');

        this.data = data;
        this.initScales();
        this.drawLine(0, 'blue');
        this.drawLine(1, 'green');
        this.drawLine(2, 'purple');
        this.drawLine(3, 'red');
    }
}
