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
          message: `Malformed separator "${line.trim()}" (should be exactly "---")`,
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
      message: 'Missing separator: content must contain at least one "---" on its own line',
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
      message: 'Missing arrangement: the last section after "---" is empty',
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
        message: `Empty part key in part ${i + 1}`,
        line: lineOffset,
      });
      continue;
    }

    // Rule: Trailing/leading whitespace on part key
    if (partKey !== partKey.trim()) {
      errors.push({
        severity: 'error',
        message: `Part key "${partKey.trim()}" has trailing or leading whitespace`,
        line: lineOffset,
      });
    }

    // Rule 4: Space in part key
    if (partKey.trim().includes(' ')) {
      errors.push({
        severity: 'error',
        message: `Part key "${partKey.trim()}" contains spaces (arrangement is space-delimited)`,
        line: lineOffset,
      });
    }

    const trimmedKey = partKey.trim();

    // Rule 7: Duplicate part keys
    if (seenKeys.has(trimmedKey)) {
      errors.push({
        severity: 'error',
        message: `Duplicate part key "${trimmedKey}" (first definition will be shadowed)`,
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
        message: `Part "${trimmedKey}" has no lyrics content`,
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
            message: `Slide in part "${trimmedKey}" has more than 2 lines (max 2 per slide)`,
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
            message: `Line has leading/trailing whitespace (will be trimmed)`,
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
            message: `Extra consecutive blank line (will be collapsed to single slide break)`,
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
        message: `Part "${trimmedKey}" has leading blank line(s) in content`,
        line: lineOffset + 1,
      });
    }
    if (contentLines.length > 0 && !contentLines[contentLines.length - 1].trim()) {
      warnings.push({
        severity: 'warning',
        message: `Part "${trimmedKey}" has trailing blank line(s) in content`,
        line: lineOffset + chunkLines.length - 1,
      });
    }
  }

  // Rule: Arrangement has trailing/leading whitespace or newlines
  if (arrangementRaw !== arrangementRaw.trim()) {
    errors.push({
      severity: 'error',
      message: 'Arrangement has trailing or leading whitespace/newlines',
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
          message: `Arrangement references undefined part "${key}"`,
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
          message: `Part "${key}" is defined but not used in arrangement`,
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

