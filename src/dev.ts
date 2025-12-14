import * as fs from 'node:fs';
import { readGedcom } from 'read-gedcom';
import { extractPersonData, personToMarkdown } from './utils/gedcom';

async function main() {
    const buffer = fs.readFileSync('src/sample-family-tree.ged');
    const gedcom = readGedcom(buffer.buffer as ArrayBuffer);
    const individuals = gedcom.getIndividualRecord();

    const outputDir = 'output';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    for (const individual of individuals.arraySelect()) {
        const person = extractPersonData(individual);
        const markdown = personToMarkdown(person);

        const fileName = `${person.id.replace(/[@]/g, '')}.md`;
        fs.writeFileSync(`${outputDir}/${fileName}`, markdown, 'utf-8');

        console.log(`Created: ${fileName}`);
    }
}

void (async () => {
    try {
        await main();
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
})();