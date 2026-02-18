import { Song, SongArrangement, SongPart, SongSlide } from '@ipc/song/song.types';

export interface ValidationMessage {
  severity: 'error' | 'warning';
  message: string;
  line?: number; // 1-based
}

export interface ValidationResult {
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  isValid: boolean; // errors.length === 0
}

/**
 * Compute the 1-based line offset for each chunk after splitting by `\n---\n`.
 * Returns an array where index i is the 1-based line number where chunk i starts.
 */
function computeChunkLineOffsets(content: string): number[] {
  const offsets: number[] = [1]; // first chunk starts at line 1
  let lineNum = 1;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '---') {
      // The chunk after this separator starts at the next line
      offsets.push(lineNum + 1);
    }
    lineNum++;
  }
  return offsets;
}

const MAX_WARNINGS_PER_CATEGORY = 3;

export function validateSongContent(content: string): ValidationResult {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];

  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n');

  // --- Warning: Malformed separator (--- with extra spaces or 4+ dashes) ---
  let malformedSepCount = 0;
  const allLines = normalized.split('\n');
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    if (line !== '---' && /^\s*-{3,}\s*$/.test(line)) {
      if (malformedSepCount < MAX_WARNINGS_PER_CATEGORY) {
        warnings.push({
          severity: 'warning',
          message: `Separator invalid "${line.trim()}" (trebuie sa fie exact "---")`,
          line: i + 1,
        });
      }
      malformedSepCount++;
    }
  }

  // Rule 1: Missing separator
  if (!normalized.includes('\n---\n')) {
    errors.push({
      severity: 'error',
      message:
        'Lipseste separatorul: continutul trebuie sa contina cel putin un "---" pe o linie separata',
    });
    return { errors, warnings, isValid: false };
  }

  const chunks = normalized.split('\n---\n');
  const chunkOffsets = computeChunkLineOffsets(normalized);
  const arrangementRaw = chunks[chunks.length - 1];
  const partChunks = chunks.slice(0, -1);

  // Rule 2: Missing arrangement
  if (!arrangementRaw.trim()) {
    errors.push({
      severity: 'error',
      message: 'Lipseste aranjamentul: ultima sectiune dupa "---" este goala',
      line: chunkOffsets[chunkOffsets.length - 1],
    });
  }

  const definedKeys = new Set<string>();
  const seenKeys = new Set<string>();

  for (let i = 0; i < partChunks.length; i++) {
    const chunk = partChunks[i];
    const chunkLines = chunk.split('\n');
    const partKey = chunkLines[0];
    const lineOffset = chunkOffsets[i];

    // Rule 3: Empty part key
    if (!partKey.trim()) {
      errors.push({
        severity: 'error',
        message: `Cheie de parte goala in partea ${i + 1}`,
        line: lineOffset,
      });
      continue;
    }

    // Rule: Trailing/leading whitespace on part key
    if (partKey !== partKey.trim()) {
      errors.push({
        severity: 'error',
        message: `Cheia partii "${partKey.trim()}" are spatii la inceput sau la sfarsit`,
        line: lineOffset,
      });
    }

    // Rule 4: Space in part key
    if (partKey.trim().includes(' ')) {
      errors.push({
        severity: 'error',
        message: `Cheia partii "${partKey.trim()}" contine spatii (aranjamentul este delimitat prin spatii)`,
        line: lineOffset,
      });
    }

    const trimmedKey = partKey.trim();

    // Rule 7: Duplicate part keys
    if (seenKeys.has(trimmedKey)) {
      errors.push({
        severity: 'error',
        message: `Cheie de parte duplicata "${trimmedKey}" (prima definitie va fi suprascrisa)`,
        line: lineOffset,
      });
    }
    seenKeys.add(trimmedKey);
    definedKeys.add(trimmedKey);

    // Rule 6: Empty part content
    const contentLines = chunkLines.slice(1);
    if (contentLines.length === 0 || contentLines.every((l) => !l.trim())) {
      errors.push({
        severity: 'error',
        message: `Partea "${trimmedKey}" nu are continut de versuri`,
        line: lineOffset,
      });
    }

    // Rule: Slide has more than 2 lines (slides are separated by blank lines)
    let slideLineCount = 0;
    let slideStartLine = lineOffset + 1;
    for (let j = 1; j < chunkLines.length; j++) {
      if (!chunkLines[j].trim()) {
        // blank line = slide boundary
        slideLineCount = 0;
        slideStartLine = lineOffset + j + 1;
      } else {
        slideLineCount++;
        if (slideLineCount > 2) {
          errors.push({
            severity: 'error',
            message: `Slide-ul din partea "${trimmedKey}" are mai mult de 2 linii (maxim 2 pe slide)`,
            line: slideStartLine,
          });
          // Skip to next blank line to avoid duplicate errors for the same slide
          while (j + 1 < chunkLines.length && chunkLines[j + 1].trim()) {
            j++;
          }
        }
      }
    }

    // --- Warnings for this part ---

    // Rule 8: Trailing/leading whitespace on content lines
    let wsCount = 0;
    for (let j = 1; j < chunkLines.length; j++) {
      const line = chunkLines[j];
      if (line !== line.trim() && line.trim().length > 0) {
        if (wsCount < MAX_WARNINGS_PER_CATEGORY) {
          warnings.push({
            severity: 'warning',
            message: 'Linia are spatii la inceput/sfarsit (vor fi eliminate)',
            line: lineOffset + j,
          });
        }
        wsCount++;
      }
    }

    // Rule 9: Extra consecutive blank lines
    let blankCount = 0;
    let extraBlankWarnings = 0;
    for (let j = 1; j < chunkLines.length; j++) {
      if (!chunkLines[j].trim()) {
        blankCount++;
        if (blankCount > 1 && extraBlankWarnings < MAX_WARNINGS_PER_CATEGORY) {
          warnings.push({
            severity: 'warning',
            message: 'Linie goala consecutiva in plus (va fi comprimata la o singura separare de slide)',
            line: lineOffset + j,
          });
          extraBlankWarnings++;
        }
      } else {
        blankCount = 0;
      }
    }

    // Rule 11: Leading/trailing blank lines in part content
    if (contentLines.length > 0 && !contentLines[0].trim()) {
      warnings.push({
        severity: 'warning',
        message: `Partea "${trimmedKey}" are linii goale la inceputul continutului`,
        line: lineOffset + 1,
      });
    }
    if (contentLines.length > 0 && !contentLines[contentLines.length - 1].trim()) {
      warnings.push({
        severity: 'warning',
        message: `Partea "${trimmedKey}" are linii goale la sfarsitul continutului`,
        line: lineOffset + chunkLines.length - 1,
      });
    }
  }

  // Rule: Arrangement has trailing/leading whitespace or newlines
  if (arrangementRaw !== arrangementRaw.trim()) {
    errors.push({
      severity: 'error',
      message: 'Aranjamentul are spatii sau linii noi la inceput/sfarsit',
      line: chunkOffsets[chunkOffsets.length - 1],
    });
  }

  // Rule 5: Undefined arrangement key
  if (arrangementRaw.trim()) {
    const arrangementKeys = arrangementRaw.trim().split(/\s+/);
    for (const key of arrangementKeys) {
      if (!definedKeys.has(key)) {
        errors.push({
          severity: 'error',
          message: `Aranjamentul face referire la o parte nedefinita "${key}"`,
          line: chunkOffsets[chunkOffsets.length - 1],
        });
      }
    }

    // Rule 10: Unused part
    const usedKeys = new Set(arrangementKeys);
    for (const key of definedKeys) {
      if (!usedKeys.has(key)) {
        warnings.push({
          severity: 'warning',
          message: `Partea "${key}" este definita, dar nu este folosita in aranjament`,
        });
      }
    }
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

export const parseSong = (id: string, name: string, data: string): Song => {
  const chunks = data.split('\n---\n');
  const arrangement: SongArrangement = chunks.slice(-1)[0].split(' ');
  const parts: SongPart[] = chunks.slice(0, -1).map((chunk) => {
    const rawSlides = chunk.split('\n');
    return {
      key: rawSlides[0].trim(),
      slides: rawSlides
        .slice(1)
        .join('\n')
        .split('\n\n')
        .map(
          (rawSlide): SongSlide => ({
            lines: rawSlide.split('\n').map((line) => line.trim()),
          }),
        ),
    };
  });

  // Extract all slide lines from all parts (excluding part keys) for search text
  const allSlideLines = parts.flatMap((part) =>
    part.slides.flatMap((slide) => slide.lines)
  );
  const lyricsContent = allSlideLines.join(' ');

  // Create search text from song name + lyrics content only (exclude part keys)
  const fullText = (
    (name + ' ' + lyricsContent)
      .toLocaleLowerCase()
      .replace(
        /[ăîșțţâş]/g,
        (charactersToReplace) =>
          ({ ă: 'a', î: 'i', ș: 's', ț: 't', â: 'a', ţ: 't', ş: 's' }[
            charactersToReplace
          ] || ''),
      )
      .match(/(\w+-\w+)|\w+/g) ?? []
  ).join(' ');

  return {
    id,
    name,
    parts,
    arrangement,
    fullText,
  };
};

/**
 * Reconstructs raw text format from parsed song data
 * Used for editing purposes - converts parsed structure back to the original text format
 */
export const reconstructRawText = (song: {
  parts: SongPart[];
  arrangement: SongArrangement;
}): string => {
  // Reconstruct each part: key\nslide1_line1\nslide1_line2\n\nslide2_line1\n\n---\n
  const partTexts = song.parts.map((part) => {
    const slideTexts = part.slides.map((slide) => slide.lines.join('\n'));
    return part.key + '\n' + slideTexts.join('\n\n');
  });

  // Join parts with --- separator and add arrangement at the end
  return partTexts.join('\n---\n') + '\n---\n' + song.arrangement.join(' ');
};
