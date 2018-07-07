class Node {
  constructor(value = '') {
    this.children = [];
    this.value = value;
  }

  add(child) {
    return this.children.push(child);
  }
}

class Trie {
    constructor() {
        this.root = new Node();
    }

    add(word) {
        let node = this.root;
        word.split('').forEach(letter => {
            let found = false;
            node.children.forEach(child => {
                if (child.value === letter) {
                    node = child;
                    found = true;
                    return;
                }
            });
            if (!found) {
                const newNode = new Node(letter);
                node.add(newNode);
                node = newNode;
            }
        });
    }

    find(prefix) {
        let node = this.root;
        prefix.split('').forEach(letter => {
            let found = false;
            node.children.forEach(child => {
                if (child.value === letter) {
                node = child;
                found = true;
                return;
                }
            });
            if (!found) {
                return;
            }
        });
        return node.value === prefix[prefix.length - 1] ? node : null;
    }

    findWordsStartingWith(prefix) {
        const node = this.find(prefix);
        if (node) {
            return constructWords(node, prefix);
        }
        return [];
    }
}

function constructWords(node, prefix = "") {
    function construct(arr, n, p) {
        return n.children.map(child => {
            if (child.children.length > 0) {
                return arr.concat(...construct(arr, child, p + child.value));
            }
            return p + child.value;
        }, []);
    }
    const words = construct([], node, prefix);
    return words.reduce((arr, w) => arr.concat(w), []);
}

const t = new Trie();
word_sample.forEach(w => t.add(w));
console.log(t.findWordsStartingWith('cat'));
