import type { Song, SongPart, SongArrangement } from '../types/song.types';

export interface SongJsonFormat {
  format: 'worship-view-song';
  version: 1;
  name: string;
  key?: string;
  parts: SongPart[];
  arrangement: SongArrangement;
}

/**
 * Convert a Song (or partial song data) to the JSON export format.
 * Omits `id`, `fullText`, and `searchText` — those are generated on import.
 */
export function songToJson(song: {
  name: string;
  parts: SongPart[];
  arrangement: SongArrangement;
  key?: string;
}): SongJsonFormat {
  return {
    format: 'worship-view-song',
    version: 1,
    name: song.name,
    ...(song.key ? { key: song.key } : {}),
    parts: song.parts,
    arrangement: song.arrangement,
  };
}

/**
 * Parse and validate a JSON string as a SongJsonFormat.
 * Returns data ready for `batchUpsertSongs` or `saveSong`.
 */
export function songFromJson(json: unknown): {
  name: string;
  key?: string;
  parts: SongPart[];
  arrangement: SongArrangement;
} {
  if (typeof json === 'string') {
    json = JSON.parse(json);
  }

  const obj = json as Record<string, unknown>;

  if (obj.format !== 'worship-view-song') {
    throw new Error('Invalid song JSON format');
  }
  if (obj.version !== 1) {
    throw new Error(`Unsupported song JSON version: ${obj.version}`);
  }
  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    throw new Error('Song JSON must have a non-empty name');
  }
  if (!Array.isArray(obj.parts) || obj.parts.length === 0) {
    throw new Error('Song JSON must have at least one part');
  }
  if (!Array.isArray(obj.arrangement) || obj.arrangement.length === 0) {
    throw new Error('Song JSON must have a non-empty arrangement');
  }

  const keyValue =
    typeof obj.key === 'string' && obj.key ? obj.key : null;

  return {
    name: obj.name as string,
    ...(keyValue ? { key: keyValue } : {}),
    parts: obj.parts as SongPart[],
    arrangement: obj.arrangement as SongArrangement,
  };
}

/**
 * Detect whether a string is our JSON song format.
 * Tries to parse the string as JSON and checks for the `format` field.
 */
export function isSongJsonFormat(content: string): boolean {
  try {
    const obj = JSON.parse(content);
    return (
      obj !== null &&
      typeof obj === 'object' &&
      obj.format === 'worship-view-song'
    );
  } catch {
    return false;
  }
}
