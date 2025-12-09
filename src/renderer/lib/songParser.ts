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

  const fullText = (
    (name + ' ' + data)
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

