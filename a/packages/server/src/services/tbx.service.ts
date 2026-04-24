import { conceptRepository } from '../repositories/concept.repository.js';
import { termEntryRepository } from '../repositories/term-entry.repository.js';
import { db, schema } from '../db/index.js';
import type { Concept, ConceptWithLanguages } from '@termbase/shared';

const { concepts, languageSections, termEntries } = schema;

export const tbxService = {
  async exportToXml(): Promise<string> {
    const { data: allConcepts } = await conceptRepository.findAll(1, 1000);

    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<!DOCTYPE martif SYSTEM "TBXcoreStructV02.dtd">');
    lines.push('<martif type="TBX">');
    lines.push('  <martifHeader>');
    lines.push('    <fileDesc>');
    lines.push('      <titleStmt><title>Termbase Export</title></titleStmt>');
    lines.push('      <sourceDesc><p>Exported from TermBase App</p></sourceDesc>');
    lines.push('    </fileDesc>');
    lines.push('  </martifHeader>');
    lines.push('  <text><body>');

    for (const concept of allConcepts) {
      lines.push(`    <termEntry id="${concept.uuid}">`);
      lines.push('      <descrip type="subjectField">' +
        (concept.subjectField ?? '') + '</descrip>');

      for (const langSection of concept.languageSections ?? []) {
        lines.push(`      <langSet xml:lang="${langSection.languageCode}">`);

        for (const term of langSection.termEntries ?? []) {
          lines.push('        <ntig>');
          lines.push(`          <termGrp>`);
          lines.push(`            <term>${escapeXml(term.termText)}</term>`);
          if (term.partOfSpeech) {
            lines.push(`            <termNote type="partOfSpeech">${escapeXml(term.partOfSpeech)}</termNote>`);
          }
          if (term.termType) {
            lines.push(`            <termNote type="termType">${escapeXml(term.termType)}</termNote>`);
          }
          if (term.status) {
            lines.push(`            <termNote type="administrativeStatus">${escapeXml(term.status)}</termNote>`);
          }
          lines.push(`          </termGrp>`);
          if (term.definitionOverride || concept.definition) {
            lines.push(`          <descrip type="definition">${escapeXml(term.definitionOverride ?? concept.definition ?? '')}</descrip>`);
          }
          if (term.contextExample) {
            lines.push(`          <descrip type="context">${escapeXml(term.contextExample)}</descrip>`);
          }
          lines.push('        </ntig>');
        }

        lines.push('      </langSet>');
      }

      lines.push('    </termEntry>');
    }

    lines.push('  </body></text>');
    lines.push('</martif>');

    return lines.join('\n');
  },

  async importFromXml(xml: string): Promise<number> {
    // Simple regex-based XML parsing (avoiding XML parser deps)
    const termEntryRegex = /<termEntry[^>]*id="([^"]*)"[^>]*>/g;
    const langSetRegex = /<langSet[^>]*xml:lang="([^"]*)"[^>]*>/g;
    const termRegex = /<term>([^<]*)<\/term>/g;
    const partOfSpeechRegex = /<termNote type="partOfSpeech">([^<]*)<\/termNote>/g;
    const termTypeRegex = /<termNote type="termType">([^<]*)<\/termNote>/g;
    const statusRegex = /<termNote type="administrativeStatus">([^<]*)<\/termNote>/g;
    const definitionRegex = /<descrip type="definition">([^<]*)<\/descrip>/g;
    const contextRegex = /<descrip type="context">([^<]*)<\/descrip>/g;
    const subjectFieldRegex = /<descrip type="subjectField">([^<]*)<\/descrip>/g;

    const text = xml;
    let imported = 0;

    // Split by termEntry
    const entries = text.split(/<\/termEntry>/);

    for (const entryBlock of entries) {
      if (!entryBlock.includes('<termEntry')) continue;

      const idMatch = /<termEntry[^>]*id="([^"]*)"[^>]*>/.exec(entryBlock);
      const sfMatch = /<descrip type="subjectField">([^<]*)<\/descrip>/.exec(entryBlock);

      // Create concept (generate new UUID on import to avoid collisions)
      const [concept] = await db.insert(concepts).values({
        subjectField: sfMatch?.[1] ?? null,
      }).returning();

      // Find language sections
      const langBlocks = entryBlock.split(/<\/langSet>/);

      for (const langBlock of langBlocks) {
        const langMatch = /<langSet[^>]*xml:lang="([^"]*)"[^>]*>/.exec(langBlock);
        if (!langMatch) continue;

        const languageCode = langMatch[1];

        const [langSection] = await db.insert(languageSections).values({
          conceptId: concept.id,
          languageCode,
        }).returning();

        // Find terms
        const termBlocks = langBlock.split(/<\/ntig>/);

        for (const termBlock of termBlocks) {
          const termMatch = /<term>([^<]*)<\/term>/.exec(termBlock);
          if (!termMatch) continue;

          const posMatch = /<termNote type="partOfSpeech">([^<]*)<\/termNote>/.exec(termBlock);
          const typeMatch = /<termNote type="termType">([^<]*)<\/termNote>/.exec(termBlock);
          const statusMatch = /<termNote type="administrativeStatus">([^<]*)<\/termNote>/.exec(termBlock);
          const defMatch = /<descrip type="definition">([^<]*)<\/descrip>/.exec(termBlock);
          const ctxMatch = /<descrip type="context">([^<]*)<\/descrip>/.exec(termBlock);

          await db.insert(termEntries).values({
            languageSectionId: langSection.id,
            termText: termMatch[1],
            partOfSpeech: posMatch?.[1] ?? null,
            termType: typeMatch?.[1] ?? null,
            status: statusMatch?.[1] ?? 'preferred',
            definitionOverride: defMatch?.[1] ?? null,
            contextExample: ctxMatch?.[1] ?? null,
          });
        }
      }

      imported++;
    }

    return imported;
  },
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
