import { useEffect } from 'react';
import { useSession, useSessionMode } from '../session/OperatorSessionContext';
import {
  useSessionSongSlide,
  useSessionVerseText,
  useSessionPresentationSlide,
} from '../session/session.hooks';
import { setProjectionType } from '../session/session.actions';

export const useManageProjection = () => {
  useProjectionType();
};

const useProjectionType = () => {
  const session = useSession();
  const mode = useSessionMode();
  const selectedSongSlide = useSessionSongSlide();
  const selectedVerseText = useSessionVerseText();
  const selectedPresentationSlide = useSessionPresentationSlide();

  // Only the desktop (session owner) should auto-manage projection type.
  // The remote just reads the current projection type from the session.
  useEffect(() => {
    if (!session || mode !== 'desktop') return;
    if (selectedSongSlide) setProjectionType(session, 'song');
  }, [session, mode, selectedSongSlide]);

  useEffect(() => {
    if (!session || mode !== 'desktop') return;
    if (selectedVerseText) setProjectionType(session, 'verse');
  }, [session, mode, selectedVerseText]);

  useEffect(() => {
    if (!session || mode !== 'desktop') return;
    if (selectedPresentationSlide) setProjectionType(session, 'presentation');
  }, [session, mode, selectedPresentationSlide]);

  useEffect(() => {
    if (!session || mode !== 'desktop') return;
    if (!selectedSongSlide && !selectedVerseText && !selectedPresentationSlide)
      setProjectionType(session, 'none');
  }, [session, mode, selectedSongSlide, selectedVerseText, selectedPresentationSlide]);
};
