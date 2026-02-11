import {
  selectedVerseReferenceAtom,
  versesHistoryAtom,
} from '@ipc/verse/verse.atoms';
import { useAtom } from 'jotai';

export function BibleVersesHistory() {
  const [versesHistory] = useAtom(versesHistoryAtom);
  const [, setSelectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  return (
    <div className="pl-2">
      <h2 className="text-2xl font-semibold mb-4">Istoric versete</h2>
      <ul className="space-y-1">
        {versesHistory.map((verseReference, index) => (
          <li
            key={index}
            onClick={() => setSelectedVerseReference(verseReference)}
            className="cursor-pointer hover:bg-accent rounded-md p-2 transition-colors"
          >
            <span>
              {verseReference.book} {verseReference.chapter}:
              {verseReference.verse}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
