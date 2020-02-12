const MS_PER_DAY = 8.64e+7;
const pad = 5;
const cellSize = 3;
const maxOpacity = 0.8;

function containsLove(message) {
    return message.toLowerCase().match(/i love you/) !== null;
}
function parseDate(d) {
    return new Date(d.timestamp.split(',').slice(0, 2).join(' '));
}
function countLove(days, data) {
    data.messages.forEach(d => {
        const date = parseDate(d);
        if (days[date] === undefined) {
            days[date] = {
                love: 0,
                messages: 0,
            };
        }
        days[date].love += containsLove(d.content) ? 1 : 0;
        days[date].messages += 1;
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
        const isAlive = Boolean(data[index].data.love);
        return new Cell(i, j, index, isAlive, data[index].data.messages);
    }));
}

class GameOfLife {
    constructor(data, width, height) {
        this.data = data;
        this.width = width;
        this.height = height
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
        this.yscale = d3.scaleLinear().domain([0, this.n]).range([this.height, pad]);

        const maxNumMessages = d3.max(this.data, d => d.messages);
        this.opacityScale = d3.scaleLinear().domain([0, maxNumMessages]).range([0.2, maxOpacity]);

        const svg = d3.select('.container')
            .append('svg')
            .attr('width', this.width + pad)
            .attr('height', this.height + pad);
        
        this.circle = svg
            .selectAll('.circle')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('cx', cell => this.xscale(cell.x))
            .attr('cy', cell => this.yscale(cell.y))
            .attr('r', cell => cell.getRadius());

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
            .attr('opacity', cell => cell.getOpacity(this.opacityScale));
        return this;
    }

    play(niters) {
        while (niters > 0) {
            this.step();
            niters--;
        }
        return this;
    }
}

class Cell {
    constructor(x, y, index, alive, messages) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.alive = alive;
        this.messages = messages;
    }

    setAlive(alive) {
        this.alive = alive;
    }

    isAlive() {
        return this.alive;
    }

    getFill() {
        return this.alive ? '#ce0f3d' : '#8e59e3';
    }

    getOpacity(scale) {
        return this.alive ? maxOpacity : scale(this.messages);
    }

    getRadius() {
        return cellSize;
    }
    
    copy() {
        return new Cell(this.x, this.y, this.index, this.alive, this.messages);
    }
}

async function load() {
    const data1 = await d3.json('../data/messages_0-100.json');
    const data2 = await d3.json('../data/messages_100-200.json');
    const data3 = await d3.json('../data/messages_200-300.json');
    const data4 = await d3.json('../data/messages_300-400.json');
    const data5 = await d3.json('../data/messages_400-500.json');
    const data6 = await d3.json('../data/messages_500-600.json');

    // TODO Could also only count each person once? 
    // TODO Could represent original message with something
    // TODO should probably be binary, cell is alive if ILY was reciprocated
    const days = {};
    countLove(days, data1);
    countLove(days, data2);
    countLove(days, data3);
    countLove(days, data4);
    countLove(days, data5);
    countLove(days, data6);

    const firstDate = parseDate(data6.messages[data6.messages.length - 1]);
    const lastDate = parseDate(data1.messages[0]);

    const calendar = [];
    let date = firstDate;
    while (date.getTime() < lastDate.getTime()) {
        date = new Date(date.getTime() + MS_PER_DAY);
        calendar.push({
            date,
            data: days[date] || { love: 0, messages: 0 }
        });
    }

    for (let i = 0; i < 9 * 3; i++) {
        const game = new GameOfLife(calendar, 150, 150);
        game.initialize().play(i);
    }
}

load();
