import { XMLBuilder, XMLParser } from "fast-xml-parser";

import { concepts } from "../db/schema/concepts";
import { languageSections } from "../db/schema/language-sections";
import { termEntries } from "../db/schema/term-entries";
import type { NodeDatabase } from "../types/database";

type TbxTermNode = {
  term?: string;
  termNote?: Array<{ "#text"?: string; "@_type"?: string }> | { "#text"?: string; "@_type"?: string };
  descrip?: Array<{ "#text"?: string; "@_type"?: string }> | { "#text"?: string; "@_type"?: string };
};

type TbxLangSetNode = {
  "@_xml:lang"?: string;
  tig?: TbxTermNode | TbxTermNode[];
};

type TbxTermEntryNode = {
  descrip?: Array<{ "#text"?: string; "@_type"?: string }> | { "#text"?: string; "@_type"?: string };
  note?: string;
  langSet?: TbxLangSetNode | TbxLangSetNode[];
};

function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function takeDescripValue(
  input: Array<{ "#text"?: string; "@_type"?: string }> | { "#text"?: string; "@_type"?: string } | undefined,
  type: string,
): string | undefined {
  return ensureArray(input).find((item) => item["@_type"] === type)?.["#text"];
}

function pickTermNote(
  input: Array<{ "#text"?: string; "@_type"?: string }> | { "#text"?: string; "@_type"?: string } | undefined,
  type: string,
): string | undefined {
  return ensureArray(input).find((item) => item["@_type"] === type)?.["#text"];
}

export class TbxService {
  constructor(private readonly db: NodeDatabase) {}

  async exportTbx(): Promise<string> {
    const conceptRows = await this.db.query.concepts.findMany({
      with: {
        languageSections: {
          with: {
            termEntries: true,
          },
        },
      },
    });

    const body = conceptRows.map((concept) => ({
      "@_id": `concept-${concept.id}`,
      descrip: [
        {
          "@_type": "definition",
          "#text": concept.definition,
        },
        ...(concept.subjectField
          ? [
              {
                "@_type": "subjectField",
                "#text": concept.subjectField,
              },
            ]
          : []),
      ],
      note: concept.note ?? undefined,
      langSet: concept.languageSections.map((section) => ({
        "@_xml:lang": section.languageCode,
        tig: section.termEntries.map((term) => ({
          term: term.termText,
          termNote: [
            { "@_type": "status", "#text": term.status },
            ...(term.termType ? [{ "@_type": "termType", "#text": term.termType }] : []),
            ...(term.partOfSpeech ? [{ "@_type": "partOfSpeech", "#text": term.partOfSpeech }] : []),
          ],
          descrip: [
            ...(term.contextExample
              ? [{ "@_type": "contextExample", "#text": term.contextExample }]
              : []),
            ...(term.definitionOverride
              ? [{ "@_type": "definitionOverride", "#text": term.definitionOverride }]
              : []),
            ...(term.source ? [{ "@_type": "source", "#text": term.source }] : []),
          ],
        })),
      })),
    }));

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true,
    });

    return builder.build({
      tbx: {
        "@_xmlns": "urn:iso:std:iso:30042:ed-2",
        "@_style": "dca",
        text: {
          body: {
            termEntry: body,
          },
        },
      },
    });
  }

  async importTbx(tbxContent: string) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      trimValues: true,
    });

    const parsed = parser.parse(tbxContent) as {
      tbx?: {
        text?: {
          body?: {
            termEntry?: TbxTermEntryNode | TbxTermEntryNode[];
          };
        };
      };
    };

    const termEntriesNode = ensureArray(parsed.tbx?.text?.body?.termEntry);
    if (termEntriesNode.length === 0) {
      return { conceptsImported: 0, termsImported: 0 };
    }

    const imported = await this.db.transaction(async (tx) => {
      let conceptCount = 0;
      let termCount = 0;

      for (const termEntryNode of termEntriesNode) {
        const definition = takeDescripValue(termEntryNode.descrip, "definition") ?? "";
        if (!definition.trim()) {
          continue;
        }

        const subjectField = takeDescripValue(termEntryNode.descrip, "subjectField");
        const note =
          typeof termEntryNode.note === "string" && termEntryNode.note.trim()
            ? termEntryNode.note
            : undefined;

        const [concept] = await tx
          .insert(concepts)
          .values({
            definition,
            subjectField,
            note,
          })
          .returning();
        conceptCount += 1;

        const langSets = ensureArray(termEntryNode.langSet);
        for (const langSet of langSets) {
          const languageCode = langSet["@_xml:lang"] ?? "und";
          const [section] = await tx
            .insert(languageSections)
            .values({
              conceptId: concept.id,
              languageCode,
            })
            .returning();

          const terms = ensureArray(langSet.tig);
          for (const termNode of terms) {
            const termText = typeof termNode.term === "string" ? termNode.term : "";
            if (!termText.trim()) {
              continue;
            }

            await tx.insert(termEntries).values({
              languageSectionId: section.id,
              termText,
              status: pickTermNote(termNode.termNote, "status") ?? "preferred",
              termType: pickTermNote(termNode.termNote, "termType"),
              partOfSpeech: pickTermNote(termNode.termNote, "partOfSpeech"),
              contextExample: takeDescripValue(termNode.descrip, "contextExample"),
              definitionOverride: takeDescripValue(termNode.descrip, "definitionOverride"),
              source: takeDescripValue(termNode.descrip, "source"),
            });
            termCount += 1;
          }
        }
      }

      return { conceptsImported: conceptCount, termsImported: termCount };
    });

    return imported;
  }
}
