const letters = {
    A: 13,
    B: 3,
    C: 3,
    D: 6,
    E: 18,
    F: 3,
    G: 4,
    H: 3,
    I: 12,
    J: 2,
    K: 2,
    L: 5,
    M: 3,
    N: 8,
    O: 11,
    P: 3,
    Q: 2,
    R: 9,
    S: 6,
    T: 9,
    U: 6,
    V: 3,
    W: 3,
    X: 2,
    Y: 3,
    Z: 2,
};

const words = new Set(word_sample);


class Board {
    constructor() {
        this.letters = [];
    }

    add(letter) {
        return this.letters.push(letter);
    }

    solve() {
        // 144 x 144 grid
        // Minimize number of letters left over
        // Minimize the number of words [i.e., longer words are better]
        // Could optimize with lexical rules
        
        /* Simulate */
        // Randomly find word
        // Iteratively randomly attach next word
    }

    simulate() {
        
    }

    computeWordList() {
        
    }

    isValid() {

    }
}

class Player {
    constructor(index, game) {
        this.name = `Player ${index}`;
        this.game = game;
        this.board = new Board();
    }

    pull() {
        this.board.add(this.game.take());
    }

    peel() {
        if (this.game.done) return;

        this.pull();
        this.solve();
    }

    dump(letters) {
        if (this.game.done) return;

        this.game.put(letters);
        this.game.shuffle();
        this.pull();
    }

    solve() {
        if (this.game.done) return;

        /* Solver stuff */
        this.board.solve();

        /* Done solving */
        if (this.game.hasLettersLeft()) {
            this.game.peel();
        } else {
            this.game.bananas(this);
        }
    }
}

class Game {
    constructor(n = 2) {
        const numPlayers = parseInt(n);
        if (typeof n !== 'number' || numPlayers > 7 || numPlayers < 2) {
            throw 'Game must have between 2 and 7 players';
        }

        this.players = [];
        let i;
        for (i = 0; i < numPlayers; i++) {
            this.players.push(new Player(i, this));
        }

        this.letters = [];
        Object.keys(letters).forEach(letter => {
            this.letters.push(...new Array(letters[letter]).fill(letter));
        });
        this.shuffle();

        this.drawSize = n <= 4 ? 21 : (n <= 6 ? 15 : 11);
    }

    draw() {
        this.players.forEach(player => {
            let i;
            for (i = 0; i < this.drawSize; i++) {
                player.pull();
            }
        });
    }

    shuffle() {
        shuffle(this.letters);
    }

    split() {
        this.players.forEach(player => {
            player.solve();
        });
    }

    take() {
        return this.letters.pop();
    }

    put(letters) {
        return this.letters.push(...letters);
    }

    peel() {
        if (this.done) return;

        this.players.forEach(player => {
            player.peel();
        });
    }

    bananas(player) {
        this.done = true;
        console.log(`${player.name} has won!`);
    }

    hasLettersLeft() {
        return this.letters.length >= this.players.length;
    }
}

function shuffle(arr) {
    let i;
    for (i = arr.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

const game = new Game();
console.log(game);