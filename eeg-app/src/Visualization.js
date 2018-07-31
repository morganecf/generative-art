import * as d3 from 'd3';

const WIDTH = 500;
const HEIGHT = 500;
const BACKGROUND = "#f5f5f5";

export default class Visualization {
    constructor({
        width,
        height,
        background,
    } = {}) {
        this.width = width || WIDTH;
        this.height = height || HEIGHT;
        this.background = background || BACKGROUND;
    }

    mount() {
        this.svg = d3
            .select('#chart')
            .style('background', this.background)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background', this.background);
    }

    unmount() {
        this.svg.remove();
        if (this.timer) {
            this.timer.stop();
        }
    }
};
