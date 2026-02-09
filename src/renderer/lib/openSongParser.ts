/**
 * OpenSong XML format parser.
 *
 * Converts OpenSong's XML song format into the app's internal raw text format
 * so that the existing parseSong() → batchUpsertSongs() pipeline handles it.
 *
 * OpenSong format reference:
 *   - <song> root element
 *   - <title>, <presentation>, <lyrics> children
 *   - Lyrics use [TAG] section headers (e.g. [V1], [C], [B2])
 *   - Lines starting with '.' are chord lines
 *   - Lines starting with ';' are comments
 *   - Lines starting with ' ' are lyric lines
 *   - '||' marks a slide break within a section
 *   - /: ... :/ marks repeat sections (inline or section-level)
 *   - Multipliers: x3, (de N ori) after :/ for repeat count
 */

const SECTION_TAG_MAP: Record<string, string> = {
  V: 'Verse',
  C: 'Chorus',
  B: 'Bridge',
  P: 'Pre-Chorus',
  T: 'Tag',
  E: 'Ending',
  I: 'Intro',
  O: 'Outro',
};

const FULL_WORD_TAG_MAP: Record<string, string> = {
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  'pre-chorus': 'Pre-Chorus',
  tag: 'Tag',
  ending: 'Ending',
  intro: 'Intro',
  outro: 'Outro',
};

/**
 * Expand an OpenSong section tag code to a readable name.
 *
 * Supports short codes (V, V1, C2), numeric-only (1→Verse1, 2→Verse2),
 * and full-word tags (chorus→Chorus, chorus 2→Chorus2, ending→Ending).
 *
 * Part keys never contain spaces so that the arrangement line
 * (space-separated) can be parsed correctly by parseSong().
 */
export function expandSectionTag(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return trimmed;

  // Numeric-only tag: "1" → "Verse1", "2" → "Verse2"
  const numericMatch = trimmed.match(/^(\d+)$/);
  if (numericMatch) {
    return `Verse${numericMatch[1]}`;
  }

  // Short letter code + optional number: V → Verse, V1 → Verse1, C2 → Chorus2
  const shortMatch = trimmed.match(/^([A-Za-z])(\d+)?$/);
  if (shortMatch) {
    const [, letter, num] = shortMatch;
    const upper = letter.toUpperCase();
    const name = SECTION_TAG_MAP[upper];
    if (name) {
      return num ? `${name}${num}` : name;
    }
  }

  // Full-word tag: "chorus" → "Chorus", "chorus 2" → "Chorus2", "ending" → "Ending"
  const wordMatch = trimmed.match(/^([a-zA-Z-]+)(?:\s+(\d+))?$/);
  if (wordMatch) {
    const [, word, num] = wordMatch;
    const lower = word.toLowerCase();
    const name = FULL_WORD_TAG_MAP[lower];
    if (name) {
      return num ? `${name}${num}` : name;
    }
    // Unknown word tag: capitalize first letter, no spaces
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    return num ? `${capitalized}${num}` : capitalized;
  }

  return trimmed;
}

/**
 * Detect whether a string is an OpenSong XML file.
 *
 * Checks for a <song> root element containing a <lyrics> child.
 */
export function isOpenSongFormat(content: string): boolean {
  try {
    const cleaned = stripBOM(content);
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, 'text/xml');

    // DOMParser returns a parsererror document on invalid XML
    if (doc.querySelector('parsererror')) return false;

    const root = doc.documentElement;
    return (
      root.tagName.toLowerCase() === 'song' &&
      root.querySelector('lyrics') !== null
    );
  } catch {
    return false;
  }
}

interface ParsedSection {
  tag: string;
  lines: string[];
  isRepeat: boolean;
  repeatMultiplier: number;
}

/**
 * Convert an OpenSong XML string to the app's internal raw text format.
 *
 * @param content  - The OpenSong XML string
 * @param fallbackName - Filename to use when <title> is absent
 * @returns { name, fullText } ready for batchUpsertSongs
 */
export function convertOpenSong(
  content: string,
  fallbackName: string,
): { name: string; fullText: string } {
  const cleaned = stripBOM(content).replace(/\r\n?/g, '\n');
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/xml');
  const root = doc.documentElement;

  // Extract metadata
  const title =
    root.querySelector('title')?.textContent?.trim() || fallbackName;
  const presentation =
    root.querySelector('presentation')?.textContent?.trim() || '';
  const lyricsRaw = root.querySelector('lyrics')?.textContent || '';

  // Parse lyrics into sections
  const sections = parseLyrics(lyricsRaw);

  if (sections.length === 0) {
    // No parseable sections — return as a single "Verse" part
    return {
      name: title,
      fullText: `Verse\n${lyricsRaw.trim()}\n---\nVerse`,
    };
  }

  // Deduplicate: if the same tag appears multiple times, merge their lines
  const deduped = deduplicateSections(sections);

  // Build arrangement from <presentation> or section definition order
  let arrangement = buildArrangement(presentation, deduped);

  // Duplicate arrangement entries for section-level repeats
  arrangement = applyArrangementRepeats(arrangement, deduped);

  // Build the internal raw text format:
  //   PartKey\nslide lines...\n---\nPartKey2\nslide lines...\n---\nArrangement
  const parts = deduped.map((section) => {
    const partKey = expandSectionTag(section.tag);
    const slideText = section.lines.join('\n');
    return `${partKey}\n${slideText}`;
  });

  const fullText = parts.join('\n---\n') + '\n---\n' + arrangement.join(' ');

  return { name: title, fullText };
}

/**
 * Parse OpenSong lyrics text into sections.
 */
function parseLyrics(raw: string): ParsedSection[] {
  const lines = raw.split('\n');
  const sections: ParsedSection[] = [];
  let currentTag = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    // Section header: [V1], [C], [B2], [chorus], [chorus 2], [1], [ending], etc.
    const headerMatch = line.match(/^\[([^\]]+)\]\s*$/);
    if (headerMatch) {
      // Save the previous section if it has content
      if (currentTag) {
        const processed = processLines(currentLines);
        if (processed.lines.length > 0) {
          sections.push({
            tag: currentTag,
            lines: processed.lines,
            isRepeat: processed.isRepeat,
            repeatMultiplier: processed.repeatMultiplier,
          });
        }
      }
      currentTag = headerMatch[1];
      currentLines = [];
      continue;
    }

    // Only collect lines if we're inside a section
    if (currentTag) {
      currentLines.push(line);
    }
  }

  // Don't forget the last section
  if (currentTag) {
    const processed = processLines(currentLines);
    if (processed.lines.length > 0) {
      sections.push({
        tag: currentTag,
        lines: processed.lines,
        isRepeat: processed.isRepeat,
        repeatMultiplier: processed.repeatMultiplier,
      });
    }
  }

  return sections;
}

interface ProcessedLines {
  lines: string[];
  isRepeat: boolean;
  repeatMultiplier: number;
}

/**
 * Process raw lyric lines within a section:
 * - Strip chord lines (starting with '.')
 * - Strip comment lines (starting with ';')
 * - Keep lyric lines (starting with ' ') — remove the leading space
 * - Handle '||' slide break markers → convert to empty line (double-newline separator)
 * - Be lenient: lines without a prefix are treated as lyrics
 * - Detect section-level repeats and expand inline repeats
 * - Enforce max 2 lines per slide
 */
function processLines(lines: string[]): ProcessedLines {
  const result: string[] = [];

  for (const line of lines) {
    // Chord line — skip
    if (line.startsWith('.')) continue;
    // Comment line — skip
    if (line.startsWith(';')) continue;

    // Slide break marker
    if (line.trim() === '||') {
      result.push('');
      continue;
    }

    // Lyric line with space prefix — strip the leading space
    if (line.startsWith(' ')) {
      result.push(line.substring(1));
      continue;
    }

    // Empty line — treat as slide separator
    if (line.trim() === '') {
      result.push('');
      continue;
    }

    // Lenient: treat anything else as a lyric line
    result.push(line);
  }

  // Trim leading/trailing empty lines
  while (result.length > 0 && result[0] === '') result.shift();
  while (result.length > 0 && result[result.length - 1] === '') result.pop();

  // Join into text for repeat processing
  const text = result.join('\n');

  // Detect section-level repeat
  const sectionRepeat = detectSectionRepeat(text);

  // Expand inline repeats on the (possibly stripped) text
  const expanded = expandRepeats(sectionRepeat.cleanedText);

  // Split back into lines
  const expandedLines = expanded.split('\n');

  // Enforce max 2 lines per slide
  const chunked = enforceMaxLinesPerSlide(expandedLines, 2);

  return {
    lines: chunked,
    isRepeat: sectionRepeat.isRepeat,
    repeatMultiplier: sectionRepeat.multiplier,
  };
}

/**
 * Detect whether the entire section content is wrapped in a single /: ... :/ pair.
 *
 * A section has a section-level repeat when the first /: opens at depth 1
 * and depth only returns to 0 at the very end.
 */
function detectSectionRepeat(text: string): {
  isRepeat: boolean;
  multiplier: number;
  cleanedText: string;
} {
  const trimmed = text.trim();
  if (!trimmed.startsWith('/:')) {
    return { isRepeat: false, multiplier: 1, cleanedText: text };
  }

  // Track bracket depth through the text
  let depth = 0;
  let i = 0;
  let firstCloseEnd = -1;

  while (i < trimmed.length) {
    if (trimmed[i] === '/' && trimmed[i + 1] === ':') {
      depth++;
      i += 2;
    } else if (trimmed[i] === ':' && trimmed[i + 1] === '/') {
      depth--;
      i += 2;
      if (depth === 0) {
        firstCloseEnd = i;
        break;
      }
    } else {
      i++;
    }
  }

  if (depth !== 0 || firstCloseEnd === -1) {
    return { isRepeat: false, multiplier: 1, cleanedText: text };
  }

  // Check if the close is at the very end (allowing only a multiplier after it)
  const remainder = trimmed.substring(firstCloseEnd).trim();

  let multiplier = 2;
  if (remainder === '') {
    // No multiplier, default 2
  } else {
    const multMatch = remainder.match(
      /^(?:x(\d+)|\(de\s+(\d+)\s+ori\))$/i,
    );
    if (multMatch) {
      multiplier = parseInt(multMatch[1] || multMatch[2], 10);
    } else {
      // There's content after the close that isn't a multiplier → not section-level
      return { isRepeat: false, multiplier: 1, cleanedText: text };
    }
  }

  // Strip the outer /: and :/ (and multiplier)
  const inner = trimmed.substring(2, firstCloseEnd - 2).trim();

  return { isRepeat: true, multiplier, cleanedText: inner };
}

/**
 * Expand all /: ... :/ repeat markers in text.
 *
 * Works iteratively from innermost pairs outward:
 * - Finds the innermost /: ... :/ pair (content contains no /: or :/)
 * - Extracts optional multiplier after :/ (x3, (de N ori), default 2)
 * - Single-line content: copies joined with \n (same slide group)
 * - Multi-line content: copies joined with \n\n (separate slide groups)
 * - Repeats until no more markers remain (max 100 iterations)
 */
export function expandRepeats(text: string): string {
  let result = text;
  const MAX_ITERATIONS = 100;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    // Find innermost /: ... :/ — content has no /: or :/ inside
    const match = result.match(
      /\/:\s*((?:(?!\/:)(?!:\/)[\s\S])*?)\s*:\/[ \t]*(?:x(\d+)|\(de\s+(\d+)\s+ori\))?/i,
    );
    if (!match) break;

    const fullMatch = match[0];
    const content = match[1];
    const multiplier = parseInt(match[2] || match[3] || '2', 10);

    // Determine if content is single-line or multi-line
    const contentLines = content.split('\n').filter((l) => l.trim() !== '');
    const isSingleLine = contentLines.length <= 1;
    const separator = isSingleLine ? '\n' : '\n\n';

    const copies = Array(multiplier).fill(content.trim()).join(separator);
    result = result.replace(fullMatch, copies);
  }

  return result;
}

/**
 * Enforce a maximum number of lines per slide.
 *
 * Slides are separated by empty lines. Any slide with more than `max` lines
 * is split into sub-slides of `max` lines each.
 */
function enforceMaxLinesPerSlide(lines: string[], max: number): string[] {
  // Split into slides by empty lines
  const slides: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line === '') {
      if (current.length > 0) {
        slides.push(current);
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    slides.push(current);
  }

  // Chunk any slide that exceeds max lines
  const chunked: string[][] = [];
  for (const slide of slides) {
    if (slide.length <= max) {
      chunked.push(slide);
    } else {
      for (let i = 0; i < slide.length; i += max) {
        chunked.push(slide.slice(i, i + max));
      }
    }
  }

  // Rejoin with empty-line separators
  const result: string[] = [];
  for (let i = 0; i < chunked.length; i++) {
    if (i > 0) result.push('');
    result.push(...chunked[i]);
  }

  return result;
}

/**
 * Duplicate arrangement entries for sections flagged as section-level repeats.
 */
function applyArrangementRepeats(
  arrangement: string[],
  sections: ParsedSection[],
): string[] {
  // Build a map of expanded tag → repeat info
  const repeatMap = new Map<string, number>();
  for (const section of sections) {
    if (section.isRepeat) {
      repeatMap.set(expandSectionTag(section.tag), section.repeatMultiplier);
    }
  }

  if (repeatMap.size === 0) return arrangement;

  // For each entry in arrangement, if it's a section-level repeat,
  // duplicate it multiplier times
  const result: string[] = [];
  for (const entry of arrangement) {
    const mult = repeatMap.get(entry);
    if (mult && mult > 1) {
      for (let i = 0; i < mult; i++) {
        result.push(entry);
      }
    } else {
      result.push(entry);
    }
  }

  return result;
}

/**
 * Deduplicate sections with the same tag by merging their lines.
 */
function deduplicateSections(sections: ParsedSection[]): ParsedSection[] {
  const seen = new Map<string, ParsedSection>();
  const order: string[] = [];

  for (const section of sections) {
    const existing = seen.get(section.tag);
    if (existing) {
      // Merge: add a slide break then the new lines
      existing.lines.push('', ...section.lines);
      // If either is a repeat, mark as repeat with the max multiplier
      if (section.isRepeat) {
        existing.isRepeat = true;
        existing.repeatMultiplier = Math.max(
          existing.repeatMultiplier,
          section.repeatMultiplier,
        );
      }
    } else {
      seen.set(section.tag, {
        tag: section.tag,
        lines: [...section.lines],
        isRepeat: section.isRepeat,
        repeatMultiplier: section.repeatMultiplier,
      });
      order.push(section.tag);
    }
  }

  return order.map((tag) => seen.get(tag)!);
}

/**
 * Build the arrangement list from the <presentation> string or section order.
 *
 * OpenSong <presentation> contains space-separated tags like "V1 C V2 C B C".
 */
function buildArrangement(
  presentation: string,
  sections: ParsedSection[],
): string[] {
  if (presentation) {
    return presentation
      .split(/\s+/)
      .filter(Boolean)
      .map((tag) => expandSectionTag(tag));
  }
  // Fallback: use the section definition order
  return sections.map((s) => expandSectionTag(s.tag));
}

/**
 * Strip UTF-8 BOM if present.
 */
function stripBOM(str: string): string {
  return str.charCodeAt(0) === 0xfeff ? str.slice(1) : str;
}
