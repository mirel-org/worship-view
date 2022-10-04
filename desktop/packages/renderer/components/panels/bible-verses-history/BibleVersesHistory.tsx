import {
  selectedVerseReferenceAtom,
  versesHistoryAtom,
} from '@ipc/verse/verse.atoms';
import { useAtom } from 'jotai';
import { OliList, OliText } from 'oli-design-system';

export function BibleVersesHistory() {
  const [versesHistory] = useAtom(versesHistoryAtom);
  const [, setSelectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  return (
    <div style={{ paddingLeft: 8 }}>
      <OliText variant='h4' text='Verses History' />
      <OliList
        items={versesHistory.map((verseReference) => ({
          key: `${verseReference.book} ${verseReference.chapter}:${verseReference.verse}`,
          text: `${verseReference.book} ${verseReference.chapter}:${verseReference.verse}`,
          onClick: () => setSelectedVerseReference(verseReference),
        }))}
      />
    </div>
  );
}
