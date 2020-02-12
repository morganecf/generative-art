const MS_PER_DAY = 8.64e+7;
const pad = 50;

function containsLove(message) {
    return message.toLowerCase().match(/i love you/) !== null;
}
function parseDate(d) {
    return new Date(d.timestamp.split(',').slice(0, 2).join(' '));
}
function countLove(days, data) {
    data.messages.forEach(d => {
        const date = parseDate(d);
        const val = containsLove(d.content) ? 1 : 0;
        days[date] = days[date] == null ? val : days[date] + val;
    });
}

class GameOfLife {
    constructor(data, width, height, speed=1000) {
        this.data = data;
        this.width = width;
        this.height = height
        this.speed = speed;
    }

    initialize() {
        const n = Math.floor(Math.sqrt(this.data.length));
        
        this.data = this.data.slice(0, n * n);
        this.grid = d3.range(n).map(() => d3.range(n).map(() => 0));

        const xscale = d3.scaleLinear().domain([0, n]).range([pad, this.width]);
        const yscale = d3.scaleLinear().domain([0, n]).range([this.height, pad]);

        const svg = d3.select('.container')
            .append('svg')
            .attr('width', this.width + (pad * 2))
            .attr('height', this.height + (pad * 2));
        
        svg.selectAll('.circle')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('cx', (d, i) => xscale(i % n))
            .attr('cy', (d, i) => yscale(Math.floor(i / n)))
            .attr('r', d => 5 + (d.val * 5))
            .attr('fill', d => d.val > 0 ? 'pink' : 'black');
        
        return this;
    }

    step(niters) {
        return this;
    }

    play(niters) {
        this.interval = setInterval(() => this.step(niters), this.speed);
        return this;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        return this;
    }
}

class Cell {
    constructor(alive) {
        this.alive = alive;
    }

    isAlive() {
        return this.alive;
    }
}

async function load() {
    const data1 = await d3.json('../data/messages_0-100.json');
    const data2 = await d3.json('../data/messages_100-200.json');
    const data3 = await d3.json('../data/messages_200-300.json');
    const data4 = await d3.json('../data/messages_300-400.json');

    // TODO Could also only count each person once? 
    // TODO Could represent original message with something
    // TODO should probably be binary, cell is alive if ILY was reciprocated
    const days = {};
    countLove(days, data1);
    countLove(days, data2);
    countLove(days, data3);
    countLove(days, data4);

    const firstDate = parseDate(data4.messages[data4.messages.length - 1]);
    const lastDate = parseDate(data1.messages[0]);

    const calendar = [];
    let date = firstDate;
    while (date.getTime() < lastDate.getTime()) {
        date = new Date(date.getTime() + MS_PER_DAY);
        calendar.push({
            date,
            val: days[date] || 0
        });
    }

    const game = new GameOfLife(calendar, 500, 1000);
    // game.initialize().play();
    game.initialize();
}

load();
