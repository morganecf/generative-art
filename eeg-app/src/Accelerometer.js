import * as d3 from 'd3';
import Visualization from './Visualization';

export default class Accelerometer extends Visualization {
    constructor() {
        super();
    }

    draw() {
        this.svg
            .append('text')
            .attr('x', 100)
            .attr('y', 100)
            .text('SORRY COMING SOON');
    }
}
