import {
  selectedVerseReferenceAtom,
  versesHistoryAtom,
} from '../../../state/verse.atoms';
import { closeSidebar } from '../../layout/Sidebar';
import { formatBibleReference } from '../../../utils/verse.utils';
import { useAtom } from 'jotai';
import { cn } from '@worship-view/ui';

export function BibleVersesHistory() {
  const [versesHistory] = useAtom(versesHistoryAtom);
  const [selectedVerseReference, setSelectedVerseReference] = useAtom(
    selectedVerseReferenceAtom,
  );

  return (
    <div className="h-full overflow-y-auto p-2">
      <ul className="space-y-1">
        {versesHistory.map((verseReference, index) => {
          const isSelected =
            selectedVerseReference?.book === verseReference.book &&
            selectedVerseReference?.chapter === verseReference.chapter &&
            selectedVerseReference?.verse === verseReference.verse;

          return (
            <li
              key={index}
              onClick={() => {
                setSelectedVerseReference(verseReference);
                closeSidebar();
              }}
              className={cn(
                'cursor-pointer rounded-md px-2 py-2 transition-colors text-sm text-foreground',
                isSelected ? 'bg-accent' : 'hover:bg-accent/70'
              )}
            >
              <span>{formatBibleReference(verseReference)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
