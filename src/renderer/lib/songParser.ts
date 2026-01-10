import { Song, SongArrangement, SongPart, SongSlide } from '@ipc/song/song.types';

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

