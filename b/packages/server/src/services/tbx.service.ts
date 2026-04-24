import type { Concept, TbxImportResult } from '@termbase/shared';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { ConceptRepository } from '../repositories/concept.repository';
import { ConceptService } from './concept.service';

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function readTextNode(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && '#text' in value) {
    return String((value as { '#text': string })['#text']);
  }

  return '';
}

export class TbxService {
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    trimValues: true,
    parseTagValue: false,
  });

  private readonly builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    format: true,
  });

  constructor(
    private readonly conceptService: ConceptService,
    private readonly conceptRepository: ConceptRepository,
  ) {}

  async exportXml() {
    const concepts = await this.conceptRepository.findAllDetailed();
    const document = {
      tbx: {
        '@_type': 'TBX-Basic',
        text: {
          body: {
            termEntry: concepts.map((concept) => ({
              '@_id': concept.uuid,
              descrip: [
                { '@_type': 'definition', '#text': concept.definition },
                { '@_type': 'subjectField', '#text': concept.subjectField },
                ...(concept.note ? [{ '@_type': 'note', '#text': concept.note }] : []),
              ],
              langSet: concept.languageSections.map((section) => ({
                '@_xml:lang': section.languageCode,
                tig: section.termEntries.map((term) => ({
                  term: term.termText,
                  termNote: [
                    { '@_type': 'termType', '#text': term.termType },
                    { '@_type': 'status', '#text': term.status },
                    ...(term.partOfSpeech
                      ? [{ '@_type': 'partOfSpeech', '#text': term.partOfSpeech }]
                      : []),
                    ...(term.contextExample
                      ? [{ '@_type': 'contextExample', '#text': term.contextExample }]
                      : []),
                    ...(term.definitionOverride
                      ? [{ '@_type': 'definitionOverride', '#text': term.definitionOverride }]
                      : []),
                    ...(term.source ? [{ '@_type': 'source', '#text': term.source }] : []),
                  ],
                })),
              })),
            })),
          },
        },
      },
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(document)}`;
  }

  async importXml(xml: string): Promise<TbxImportResult> {
    const parsed = this.parser.parse(xml);
    const termEntries = toArray(parsed?.tbx?.text?.body?.termEntry);
    const createdConcepts: Concept[] = [];

    for (const entry of termEntries) {
      const descriptions = toArray(entry.descrip);
      const definition = readTextNode(
        descriptions.find((item: { '@_type'?: string }) => item['@_type'] === 'definition'),
      );
      const subjectField = readTextNode(
        descriptions.find((item: { '@_type'?: string }) => item['@_type'] === 'subjectField'),
      );
      const note = readTextNode(
        descriptions.find((item: { '@_type'?: string }) => item['@_type'] === 'note'),
      );

      const languageSections = toArray(entry.langSet).map((langSet: Record<string, unknown>) => {
        const tigs = toArray(langSet.tig);
        return {
          languageCode: String(langSet['@_xml:lang'] ?? 'en'),
          termEntries: tigs.map((tig) => {
            const termNotes = toArray<Record<string, unknown>>((tig as { termNote?: Record<string, unknown> | Record<string, unknown>[] }).termNote);
            const getNote = (type: string) =>
              readTextNode(termNotes.find((item) => item['@_type'] === type)) || null;

            return {
              termText: readTextNode((tig as { term?: unknown }).term),
              termType: (getNote('termType') ?? 'fullForm') as 'fullForm' | 'acronym' | 'abbreviation' | 'variant',
              status: (getNote('status') ?? 'preferred') as 'preferred' | 'admitted' | 'deprecated',
              partOfSpeech: getNote('partOfSpeech'),
              contextExample: getNote('contextExample'),
              definitionOverride: getNote('definitionOverride'),
              source: getNote('source'),
            };
          }),
        };
      });

      const concept = await this.conceptService.createConcept({
        definition: definition || 'Imported concept',
        subjectField: subjectField || 'General',
        note: note || null,
        languageSections,
      });
      createdConcepts.push(concept);
    }

    return {
      importedConcepts: createdConcepts.length,
      importedTerms: createdConcepts.reduce(
        (total, concept) =>
          total + concept.languageSections.reduce((sectionTotal, section) => sectionTotal + section.termEntries.length, 0),
        0,
      ),
      concepts: createdConcepts,
    };
  }
}
