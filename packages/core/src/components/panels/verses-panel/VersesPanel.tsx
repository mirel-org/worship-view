import { FC, useMemo } from 'react';
import bibleText from '@assets/bibles/VDC.json';
import VerseListItem from './verse-list-item/VerseListItem';
import { BibleTextType } from '../../../types/verse.types';
import { formatBibleChapterReference } from '../../../utils/verse.utils';
import usePreventScroll from '../../../hooks/usePreventScroll';
import { useSession } from '../../../session/OperatorSessionContext';
import {
  useSessionVerseRef,
  useSessionProjectionType,
  useSessionVerseProjectionEnabled,
} from '../../../session/session.hooks';
import { setVerseRef } from '../../../session/session.actions';

const VersesPanel: FC = () => {
  const session = useSession();
  const selectedVerseReference = useSessionVerseRef();
  const currentProjectionType = useSessionProjectionType();
  const verseProjectionEnabled = useSessionVerseProjectionEnabled();
  const chapterVerses: string[] = useMemo(() => {
    if (!selectedVerseReference) return [];
    return (bibleText as BibleTextType)[selectedVerseReference.book][
      selectedVerseReference.chapter - 1
    ];
  }, [selectedVerseReference]);

  const handleVerseSelection = (verseIndex: number) => {
    if (!selectedVerseReference || !session) return;
    setVerseRef(session, {
      ...selectedVerseReference,
      verse: verseIndex,
    });
  };
  const { ref } = usePreventScroll<HTMLDivElement>();
  const isVerseLiveOnAudience =
    currentProjectionType === 'verse' && verseProjectionEnabled;

  return (
    <div ref={ref} className="h-full overflow-y-auto px-4 sm:px-8 md:px-16 lg:px-[120px] pt-3 pb-[72px]">
      <div className="space-y-2">
        {selectedVerseReference && (
          <span className="inline-flex items-center justify-center rounded-2xl border border-border bg-secondary px-2 py-0.5 text-[11px] font-semibold tracking-[0.5px] text-secondary-foreground">
            {formatBibleChapterReference(selectedVerseReference)}
          </span>
        )}

        <div className="space-y-2.5">
          {chapterVerses.map((verse, index) => (
            <VerseListItem
              key={index}
              reference={index + 1}
              text={verse}
              selected={selectedVerseReference?.verse === index + 1}
              liveState={
                selectedVerseReference?.verse === index + 1
                  ? isVerseLiveOnAudience
                    ? 'live'
                    : 'selected'
                  : null
              }
              onClick={handleVerseSelection}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersesPanel;
