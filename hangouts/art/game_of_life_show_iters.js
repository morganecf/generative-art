const MS_PER_DAY = 8.64e+7;
const cellSize = 3;
const maxOpacity = 0.8;
const numRows = 13;
const numCols = 4;
const gridSize = 150;
const pad = 5;
const aliveColor = '#ce0f3d';
const deadColor = '#8e59e3';

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
        return new Cell(i, j, index, isAlive, data[index].data.messages, data[index].date);
    }));
}
function printCellInfo(cell) {
    console.log(`${cell.date}: ${cell.messages} messages`);
}

class GameOfLife {
    constructor(data) {
        this.data = data;
    }

    initialize() {
        this.n = Math.floor(Math.sqrt(this.data.length));
        this.data = this.data.slice(0, this.n * this.n);
        this.grid = initializeGridFromData(this.n, this.data);
        this.data = this.data.map((d, i) => {
            const { x, y } = getCoordsFromIndex(i, this.n);
            return this.grid[x][y];
        });

        this.xscale = d3.scaleLinear().domain([0, this.n]).range([pad, gridSize]);
        this.yscale = d3.scaleLinear().domain([this.n, 0]).range([gridSize, pad]);

        const maxNumMessages = d3.max(this.data, d => d.messages);
        this.opacityScale = d3.scaleLinear().domain([0, maxNumMessages]).range([0.2, maxOpacity]);
    
        this.circle = d3.select('.container')
            .append('svg')
            .attr('width', gridSize + pad)
            .attr('height', gridSize + pad)
            .selectAll('.circle')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('cx', cell => this.xscale(cell.x))
            .attr('cy', cell => this.yscale(cell.y))
            .attr('r', cell => cell.getRadius())
            .on('mouseover', printCellInfo);

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
    constructor(x, y, index, alive, messages, date) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.alive = alive;
        this.messages = messages;
        this.date = date;
    }

    setAlive(alive) {
        this.alive = alive;
    }

    isAlive() {
        return this.alive;
    }

    getFill() {
        return this.alive ? aliveColor : deadColor;
    }

    getOpacity(scale) {
        return this.alive ? maxOpacity : scale(this.messages);
    }

    getRadius() {
        return cellSize;
    }
    
    copy() {
        return new Cell(this.x, this.y, this.index, this.alive, this.messages, this.date);
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
            data: days[date] || { love: 0, messages: 0 }
        });
    }

    // Draw each iteration
    for (let i = 0; i < numRows * numCols; i++) {
        const game = new GameOfLife(calendar);
        game.initialize().play(i);
    }
}

load();
