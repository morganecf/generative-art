const MS_PER_DAY = 8.64e+7;
const pad = 50;
const cellSize = 7;

function containsLove(message) {
    return message.toLowerCase().match(/i love you/) !== null;
}
function parseDate(d) {
    const date = d.timestamp.split(',').slice(0, 2).join(' ');
    return new Date(`${date} 1:00 PM`);
}
function countLove(days, data) {
    data.messages.forEach(d => {
        const date = parseDate(d);
        const val = containsLove(d.content) ? 1 : 0;
        days[date] = days[date] == null ? val : days[date] + val;
    });
}
function getIndexFromCoords(i, j, n) {
    return (j * n) + i;
}
function getCoordsFromIndex(index, n) {
    return {
        x: index % n,
        y: Math.floor(index / n),
    };
}
function getNeighborCoords(cell) {
    return [
        [cell.x, cell.y + 1],
        [cell.x, cell.y - 1],
        [cell.x + 1, cell.y],
        [cell.x - 1, cell.y],
        [cell.x + 1, cell.y + 1],
        [cell.x - 1, cell.y - 1],
        [cell.x + 1, cell.y - 1],
        [cell.x - 1, cell.y + 1],
    ];
}
function getNumAliveNeighbors(cell, grid) {
    return getNeighborCoords(cell).filter(coords => {
        try {
            return grid[coords[0]][coords[1]].isAlive();
        } catch (err) {
            return false;
        }
    }).length;
}
function initializeGridFromData(n, data) {
    return d3.range(n).map((x, i) => d3.range(n).map((y, j) => {
        const index = getIndexFromCoords(i, j, n);
        const isAlive = Boolean(data[index].val);
        return new Cell(i, j, index, isAlive, data[index].date);
    }));
}

class GameOfLife {
    constructor(data, width, height, speed=1000) {
        this.data = data;
        this.width = width;
        this.height = height
        this.speed = speed;
    }

    initialize() {
        this.n = Math.floor(Math.sqrt(this.data.length));
        this.data = this.data.slice(0, this.n * this.n);
        this.grid = initializeGridFromData(this.n, this.data);
        this.data = this.data.map((d, i) => {
            const { x, y } = getCoordsFromIndex(i, this.n);
            return this.grid[x][y];
        });

        this.xscale = d3.scaleLinear().domain([0, this.n]).range([pad, this.width]);
        this.yscale = d3.scaleLinear().domain([this.n, 0]).range([this.height, pad]);

        const svg = d3.select('.container')
            .append('svg')
            .attr('width', this.width + (pad * 2))
            .attr('height', this.height + (pad * 2));
        
        this.circle = svg
            .selectAll('.circle')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('cx', cell => this.xscale(cell.x))
            .attr('cy', cell => this.yscale(cell.y))
            .attr('r', cell => cell.getRadius())
            .on('mouseover', cell => console.log(cell.date));

        this.updateDisplay();
        return this;
    }

    step() {
        this.updateGrid().updateDisplay();
        return this;
    }

    updateGrid() {
        const newData = this.data.map(cell => {
            const cellCopy = cell.copy();
            const n = getNumAliveNeighbors(cell, this.grid);
            // Dies if has fewer than 2 neighbors or more than 3
            if (cell.isAlive() && (n < 2 || n > 3)) {
                cellCopy.setAlive(false);
                return cellCopy;
            } else if (n === 3) {
                // Becomes alive if has exactly 3 neighbors
                cellCopy.setAlive(true);
                return cellCopy;
            }
            return cell;
        });
        this.data.forEach((cell, i) => {
            cell.setAlive(newData[i].alive);
        });
        return this;
    }

    updateDisplay() {
        this.circle
            .attr('fill', cell => cell.getFill())
            .attr('stroke', cell => cell.getStroke());
        return this;
    }

    play(niters) {
        this.interval = setInterval(() => {
            if (niters === 0) {
                this.stop();
            } else {
                niters--;
                this.step();
            }
        }, this.speed);
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
    constructor(x, y, index, alive, date) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.alive = alive;
        this.date = date;
    }

    setAlive(alive) {
        this.alive = alive;
    }

    isAlive() {
        return this.alive;
    }

    getFill() {
        return this.alive ? 'red' : '#fff';
    }

    getStroke() {
        return this.alive ? 'red' : 'grey';
    }

    getRadius() {
        // return this.alive ? this.alive * 10 : 5;
        return cellSize;
    }
    
    copy() {
        return new Cell(this.x, this.y, this.index, this.alive, this.date);
    }
}

async function load() {
    const data1 = await d3.json('../data/messages_0-100.json');
    const data2 = await d3.json('../data/messages_100-200.json');
    const data3 = await d3.json('../data/messages_200-300.json');
    const data4 = await d3.json('../data/messages_300-400.json');
    const data5 = await d3.json('../data/messages_400-500.json');
    const data6 = await d3.json('../data/messages_500-600.json');
    const data7 = await d3.json('../data/messages_600-700.json');

    const days = {};
    countLove(days, data1);
    countLove(days, data2);
    countLove(days, data3);
    countLove(days, data4);
    countLove(days, data5);
    countLove(days, data6);
    countLove(days, data7);

    const firstDate = parseDate(data7.messages[data7.messages.length - 1]);
    const lastDate = parseDate(data1.messages[0]);

    const calendar = [];
    let date = firstDate;
    while (date.getTime() < lastDate.getTime()) {
        date = new Date(date.getTime() + MS_PER_DAY);
        date.setHours(13);
        calendar.push({
            date,
            val: days[date] || 0
        });
    }

    const game = new GameOfLife(calendar, 500, 500);
    game.initialize().play();
}

load();
