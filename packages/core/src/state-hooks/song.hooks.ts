import { useCallback, useEffect, useRef } from 'react';
import { useSession, useSessionMode } from '../session/OperatorSessionContext';
import {
  useSessionSongText,
  useSessionSongSlideRef,
  useSessionSong,
} from '../session/session.hooks';
import {
  gotoNextSongSlide,
  gotoPrevSongSlide,
  clearSong as clearSongAction,
  setSongSlideRef,
  selectSong,
} from '../session/session.actions';

export const useSongControll = () => {
  const session = useSession();
  const songText = useSessionSongText();
  const slideRef = useSessionSongSlideRef();

  const gotoNextSlide = useCallback(() => {
    if (!session || !slideRef || !songText) return;
    gotoNextSongSlide(session, songText);
  }, [session, slideRef, songText]);

  const gotoPreviousSlide = useCallback(() => {
    if (!session || !slideRef || !songText) return;
    gotoPrevSongSlide(session, songText);
  }, [session, slideRef, songText]);

  const clearSong = useCallback(() => {
    if (!session) return;
    clearSongAction(session);
  }, [session]);

  return { gotoNextSlide, gotoPreviousSlide, clearSong };
};

export const useManageSongs = () => {
  const session = useSession();
  const mode = useSessionMode();
  const song = useSessionSong();
  const prevSongIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only the desktop (session owner) should auto-manage slide refs
    if (!session || mode !== 'desktop') return;
    if (song) {
      if (prevSongIdRef.current !== song.id) {
        setSongSlideRef(session, 0, 0);
        prevSongIdRef.current = song.id;
      }
    } else {
      prevSongIdRef.current = null;
    }
  }, [session, mode, song]);
};
