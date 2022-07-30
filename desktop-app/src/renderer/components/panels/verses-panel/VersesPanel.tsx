import React, { FC, useMemo } from 'react';
import bibleText from '@assets/bibles/VDC.json';
import { useAtom } from 'jotai';
import { selectedVerseReferenceAtom } from '../../../../ipc/verse/verse.atoms';
import VerseListItem from './verse-list-item/VerseListItem';
import { BibleTextType } from '@ipc/verse/verse.types';
import { verseProjectionEnabledAtom } from '@ipc/projection/projection.atoms';
import styled from 'styled-components';
import usePreventScroll from '@renderer/hooks/usePreventScroll';

const VersesPanel: FC = () => {
  const [selectedVerseReference, setSelectedVerseReference] = useAtom(
    selectedVerseReferenceAtom,
  );
  const [verseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
  const chapterVerses: string[] = useMemo(() => {
    if (!selectedVerseReference) return [];
    return (bibleText as BibleTextType)[selectedVerseReference.book][
      selectedVerseReference.chapter - 1
    ];
  }, [selectedVerseReference]);

  const handleVerseSelection = (verseIndex: number) => {
    if (!selectedVerseReference) return;
    setSelectedVerseReference({
      ...selectedVerseReference,
      verse: verseIndex,
    });
  };
  const { ref } = usePreventScroll<HTMLDivElement>();

  return (
    <Wrapper ref={ref}>
      {chapterVerses.map((verse, index) => (
        <VerseListItem
          enabled={verseProjectionEnabled}
          key={index}
          reference={index + 1}
          text={verse}
          selected={selectedVerseReference?.verse === index + 1}
          onClick={handleVerseSelection}
        />
      ))}
    </Wrapper>
  );
};

export default VersesPanel;

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
`;
