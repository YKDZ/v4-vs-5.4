import type { DB } from '../db/index.js';
import { ConceptRepository } from '../repositories/concept.repository.js';
import { TermEntryRepository } from '../repositories/term-entry.repository.js';
import { concepts, languageSections, termEntries } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

/**
 * Minimal TBX (ISO 30042) importer/exporter.
 * Follows a simplified TBX-Basic document layout:
 *
 * <martif type="TBX">
 *   <text><body>
 *     <termEntry id="c1">
 *       <descrip type="definition">...</descrip>
 *       <descrip type="subjectField">...</descrip>
 *       <langSet xml:lang="en">
 *         <tig>
 *           <term>user interface</term>
 *           <termNote type="partOfSpeech">noun</termNote>
 *           <termNote type="administrativeStatus">preferred</termNote>
 *         </tig>
 *       </langSet>
 *     </termEntry>
 *   </body></text>
 * </martif>
 */
export class TbxService {
  private conceptRepo: ConceptRepository;
  private termRepo: TermEntryRepository;
  constructor(private db: DB) {
    this.conceptRepo = new ConceptRepository(db);
    this.termRepo = new TermEntryRepository(db);
  }

  async exportAll(): Promise<string> {
    const allConcepts = await this.db.select().from(concepts);
    const allSections = await this.db.select().from(languageSections);
    const allTerms = await this.db.select().from(termEntries);

    const sectionsByConcept = new Map<number, typeof allSections>();
    for (const s of allSections) {
      const arr = sectionsByConcept.get(s.conceptId) ?? [];
      arr.push(s);
      sectionsByConcept.set(s.conceptId, arr);
    }
    const termsBySection = new Map<number, typeof allTerms>();
    for (const t of allTerms) {
      const arr = termsBySection.get(t.languageSectionId) ?? [];
      arr.push(t);
      termsBySection.set(t.languageSectionId, arr);
    }

    const entries: string[] = [];
    for (const c of allConcepts) {
      const langBlocks: string[] = [];
      const sections = sectionsByConcept.get(c.id) ?? [];
      for (const sec of sections) {
        const termBlocks = (termsBySection.get(sec.id) ?? []).map((t) => {
          const notes: string[] = [];
          if (t.partOfSpeech) notes.push(`        <termNote type="partOfSpeech">${xml(t.partOfSpeech)}</termNote>`);
          if (t.termType) notes.push(`        <termNote type="termType">${xml(t.termType)}</termNote>`);
          if (t.status) notes.push(`        <termNote type="administrativeStatus">${xml(t.status)}</termNote>`);
          if (t.source) notes.push(`        <admin type="source">${xml(t.source)}</admin>`);
          const ctx = t.contextExample ? `\n        <descrip type="context">${xml(t.contextExample)}</descrip>` : '';
          const defOv = t.definitionOverride ? `\n        <descrip type="definition">${xml(t.definitionOverride)}</descrip>` : '';
          return `      <tig>
        <term>${xml(t.termText)}</term>${notes.length ? '\n' + notes.join('\n') : ''}${ctx}${defOv}
      </tig>`;
        });
        langBlocks.push(`    <langSet xml:lang="${xml(sec.languageCode)}">
${termBlocks.join('\n')}
    </langSet>`);
      }
      const descrip: string[] = [];
      if (c.definition) descrip.push(`    <descrip type="definition">${xml(c.definition)}</descrip>`);
      if (c.subjectField) descrip.push(`    <descrip type="subjectField">${xml(c.subjectField)}</descrip>`);
      if (c.note) descrip.push(`    <descrip type="note">${xml(c.note)}</descrip>`);
      entries.push(`  <termEntry id="c${c.id}">
${descrip.join('\n')}${descrip.length ? '\n' : ''}${langBlocks.join('\n')}
  </termEntry>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<martif type="TBX" xml:lang="en">
<text><body>
${entries.join('\n')}
</body></text>
</martif>
`;
  }

  /**
   * Very small XML parser sufficient for TBX-Basic documents we generate.
   * Not a general-purpose XML parser; rejects anything it can't handle.
   */
  async importFromXml(xmlText: string): Promise<{ importedConcepts: number; importedTerms: number }> {
    const entries = findAll(xmlText, /<termEntry\b[^>]*>([\s\S]*?)<\/termEntry>/g);
    let importedConcepts = 0;
    let importedTerms = 0;
    for (const entryXml of entries) {
      const definition = getDescrip(entryXml, 'definition');
      const subjectField = getDescrip(entryXml, 'subjectField');
      const note = getDescrip(entryXml, 'note');
      const concept = await this.conceptRepo.create({
        definition: definition ?? null,
        subjectField: subjectField ?? null,
        note: note ?? null,
      });
      importedConcepts++;
      const langSets = findAllWithAttrs(entryXml, /<langSet\b([^>]*)>([\s\S]*?)<\/langSet>/g);
      for (const { attrs, body } of langSets) {
        const lang = getAttr(attrs, 'xml:lang');
        if (!lang) continue;
        const tigs = findAll(body, /<tig\b[^>]*>([\s\S]*?)<\/tig>/g);
        for (const tig of tigs) {
          const termText = getTag(tig, 'term');
          if (!termText) continue;
          await this.termRepo.createForConcept(concept.id, {
            languageCode: lang,
            termText,
            partOfSpeech: getTermNote(tig, 'partOfSpeech'),
            termType: (getTermNote(tig, 'termType') as any) ?? null,
            status: (getTermNote(tig, 'administrativeStatus') as any) ?? null,
            contextExample: getDescrip(tig, 'context'),
            definitionOverride: getDescrip(tig, 'definition'),
            source: getAdmin(tig, 'source'),
          });
          importedTerms++;
        }
      }
    }
    return { importedConcepts, importedTerms };
  }

  async clearAll() {
    // Delete in FK-safe order (no where = delete all rows)
    await this.db.delete(termEntries);
    await this.db.delete(languageSections);
    await this.db.delete(concepts);
  }
}

function xml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unxml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function findAll(text: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}
function findAllWithAttrs(text: string, re: RegExp): { attrs: string; body: string }[] {
  const out: { attrs: string; body: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push({ attrs: m[1], body: m[2] });
  return out;
}
function getAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*"([^"]*)"`);
  const m = re.exec(attrs);
  return m ? unxml(m[1]) : null;
}
function getTag(xmlIn: string, tag: string): string | null {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const m = re.exec(xmlIn);
  return m ? unxml(m[1]).trim() : null;
}
function getDescrip(xmlIn: string, type: string): string | null {
  const re = new RegExp(`<descrip\\s+[^>]*type="${type}"[^>]*>([\\s\\S]*?)<\\/descrip>`);
  const m = re.exec(xmlIn);
  return m ? unxml(m[1]).trim() : null;
}
function getTermNote(xmlIn: string, type: string): string | null {
  const re = new RegExp(`<termNote\\s+[^>]*type="${type}"[^>]*>([\\s\\S]*?)<\\/termNote>`);
  const m = re.exec(xmlIn);
  return m ? unxml(m[1]).trim() : null;
}
function getAdmin(xmlIn: string, type: string): string | null {
  const re = new RegExp(`<admin\\s+[^>]*type="${type}"[^>]*>([\\s\\S]*?)<\\/admin>`);
  const m = re.exec(xmlIn);
  return m ? unxml(m[1]).trim() : null;
}
