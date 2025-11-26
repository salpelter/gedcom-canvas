import * as fs from 'node:fs';
import * as readline from 'node:readline';
import { Node } from './models/Node';

async function main() {
    const lines: string[] = await readFile('src/sample-family-tree.ged')

    const nodes: Node[] = parseGedcom(lines);
    console.log(nodes);
}

async function readFile(path: string): Promise<string[]> {
    const lines: string[] = [];

    const stream = fs.createReadStream(path, { encoding: 'utf-8' });

    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of rl) {
        lines.push(line);
    }

    return lines;
}

function parseGedcom(lines: string[]): Node[] {
    const nodes: Node[] = [];

    for (const line of lines) {
        const split = line.trim().split(/\s+/);
        if (split.length === 0)
            continue;

        if (!split[0])
            continue;
        const levelStr: string = split[0];
        const level: number = Number.parseInt(levelStr);

        if (!split[1])
            continue;
        const tag: string = split[1];

        if (!split[2])
            continue;
        const payload: string = split.slice(2).join(' ');

        nodes.push(new Node(level, tag, payload));
    }

    return nodes;
}

void (async () => {
    try {
        await main();
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
})();