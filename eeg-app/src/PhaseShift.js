import * as d3 from 'd3';
import Visualization from './Visualization';

export default class PhaseShift extends Visualization {
    constructor(options) {
        super(options);

        this.rectSize = this.width / 3;
        this.opacity = options.opacity;
        this.slowFactor = options.slowFactor;
        this.n = options.numSamples;
        this.color = options.color;
        this.angle = options.angle;

        this.scale = d3
            .scaleLinear()
            .range([0, this.n]);
    }

    draw(rawData) {
        const g = this.svg
            .append('g')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

        this.data = rawData;
        const extent = [
            d3.min(this.data, d => d3.min(d.samples)),
            d3.max(this.data, d => d3.max(d.samples)),
        ];
        this.scale.domain(extent);

        const data = this.data.map(d => ({
            electrode: d.electrode,
            reading: this.scale(d3.max(d.samples)), // min/max look a bit more eye-like? mean smooths it out?
        })).slice(0, this.n);

        const paths = g
            .selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', this.color)
            .attr('stroke-width', this.rectSize)
            .attr('stroke-opacity', this.opacity);

        this.timer = d3.timer(t => {
            paths
                .attr('d', (d, i) => {
                    // Angle (phase shift): as function of index is more phasic (i.e. looks like circle)
                    // As function of eeg reading is more static/rectangular
                    const a = this.angle(d, i) / this.n;
                    // Length of lines
                    const r0 = this.rectSize * Math.sin(d.reading * t / this.slowFactor / this.n);
                    const r1 = this.rectSize * Math.cos(d.reading * t / this.slowFactor / this.n) / 4;
                    return `M${r0 * Math.cos(a)},${r0 * Math.sin(a)} L ${r1 * Math.cos(a)},${r1 * Math.sin(a)}`;
                });
        });
    }
}
