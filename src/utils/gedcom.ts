import { SelectionIndividualRecord } from 'read-gedcom';

export interface PersonData {
    id: string;
    name: string;
    givenName?: string;
    surname?: string;
    sex?: string;
    birthDate?: string;
    birthPlace?: string;
    deathDate?: string;
    deathPlace?: string;
    parents: string[];
    spouses: string[];
    children: string[];
}

export function extractPersonData(individual: SelectionIndividualRecord): PersonData {
    const id = individual.pointer().values().toArray().at(0) ?? '';

    const nameParts = individual.getName().valueAsParts();
    const fullNameArray = nameParts.at(0)?.filter(Boolean) ?? [];
    const name = fullNameArray.join(' ') || 'Unknown';

    const givenName = individual.getName().getGivenName()?.value().at(0) ?? undefined;
    const surname = individual.getName().getSurname()?.value().at(0) ?? undefined;
    const sex = individual.getSex()?.value().at(0) ?? undefined;

    const birth = individual.getEventBirth();
    const birthDate = birth?.getDate()?.value().at(0) ?? undefined;
    const birthPlace = birth?.getPlace()?.value().at(0) ?? undefined;

    const death = individual.getEventDeath();
    const deathDate = death?.getDate()?.value().at(0) ?? undefined;
    const deathPlace = death?.getPlace()?.value().at(0) ?? undefined;

    const parents: string[] = [];
    const spouses: string[] = [];
    const children: string[] = [];

    // get all families where this person is a child
    const familiesAsChild = individual.getFamilyAsChild();
    const childFamilies = Array.isArray(familiesAsChild) ? familiesAsChild : (familiesAsChild ? [familiesAsChild] : []);

    for (const family of childFamilies) {
        const father = family.getHusband()?.getIndividualRecord();
        const mother = family.getWife()?.getIndividualRecord();
        if (father) {
            const fatherId = father.pointer().value;
            if (fatherId) parents.push(fatherId);
        }
        if (mother) {
            const motherId = mother.pointer().value;
            if (motherId) parents.push(motherId);
        }
    }

    // get all families where this person is a spouse
    const familiesAsSpouse = individual.getFamilyAsSpouse();
    const spouseFamilies = Array.isArray(familiesAsSpouse) ? familiesAsSpouse : (familiesAsSpouse ? [familiesAsSpouse] : []);

    for (const family of spouseFamilies) {
        const husband = family.getHusband()?.getIndividualRecord();
        const wife = family.getWife()?.getIndividualRecord();

        // add the other spouse (the one that's NOT this person)
        const spouseRecord = husband?.pointer().value === id ? wife : husband;
        if (spouseRecord) {
            const spouseId = spouseRecord.pointer().value;
            if (spouseId) spouses.push(spouseId);
        }

        // add children
        const childRecords = family.getChild();
        const childArray = Array.isArray(childRecords) ? childRecords : (childRecords ? [childRecords] : []);

        for (const child of childArray) {
            const childId = child.getIndividualRecord().pointer().value;
            if (childId) children.push(childId);
        }
    }

    return {
        id,
        name,
        givenName,
        surname,
        sex,
        birthDate,
        birthPlace,
        deathDate,
        deathPlace,
        parents,
        spouses,
        children
    };
}

export function personToMarkdown(person: PersonData): string {
    const frontmatter = [
        '---',
        `id: ${person.id}`,
        `name: "${person.name}"`,
        person.givenName ? `givenName: "${person.givenName}"` : null,
        person.surname ? `surname: "${person.surname}"` : null,
        person.sex ? `sex: ${person.sex}` : null,
        person.birthDate ? `birthDate: "${person.birthDate}"` : null,
        person.birthPlace ? `birthPlace: "${person.birthPlace}"` : null,
        person.deathDate ? `deathDate: "${person.deathDate}"` : null,
        person.deathPlace ? `deathPlace: "${person.deathPlace}"` : null,
        person.parents.length > 0 ? `parents:\n${person.parents.map(p => `  - ${p}`).join('\n')}` : null,
        person.spouses.length > 0 ? `spouses:\n${person.spouses.map(s => `  - ${s}`).join('\n')}` : null,
        person.children.length > 0 ? `children:\n${person.children.map(c => `  - ${c}`).join('\n')}` : null,
        '---',
    ].filter(Boolean).join('\n');

    const body = [
        `# ${person.name}`,
        '',
        person.birthDate || person.birthPlace ? `**Born:** ${person.birthDate ?? ''}${person.birthPlace ? ` in ${person.birthPlace}` : ''}` : null,
        person.deathDate || person.deathPlace ? `**Died:** ${person.deathDate ?? ''}${person.deathPlace ? ` in ${person.deathPlace}` : ''}` : null,
    ].filter(Boolean).join('\n');

    return `${frontmatter}\n\n${body}`;
}