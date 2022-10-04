import { trpc } from '@common/trpc';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getNodeApiClient } from '..';
import {
  selectedSongAtom,
  selectedSongSlideReferenceAtom,
  selectedSongTextAtom,
} from './song.atoms';
import { TSong, TClientSong } from 'shared-types/src/song/song.types';
import { mapServerSongToClientSong } from './song.utils';

export const useLocalSongs = () => {
  const { getSongs } = getNodeApiClient();
  const [songs, setSongs] = useState<TSong[]>([]);
  useEffect(() => {
    getSongs().then((songs) => setSongs(songs));
  }, [getSongs]);
  return songs;
};

export const useSongControll = () => {
  const [selectedSongSlideReference, setSelectedSongSlideReference] = useAtom(
    selectedSongSlideReferenceAtom,
  );
  const [selectedSongText] = useAtom(selectedSongTextAtom);
  const [, setSelectedSong] = useAtom(selectedSongAtom);

  const gotoNextSlide = useCallback(() => {
    if (!selectedSongSlideReference || !selectedSongText) return;
    const { partIndex, slideIndex } = selectedSongSlideReference;

    if (selectedSongText[partIndex]?.slides[slideIndex + 1]) {
      setSelectedSongSlideReference({ partIndex, slideIndex: slideIndex + 1 });
      return;
    }
    if (selectedSongText[partIndex + 1]?.slides[0]) {
      setSelectedSongSlideReference({
        partIndex: partIndex + 1,
        slideIndex: 0,
      });
      return;
    }
  }, [
    selectedSongSlideReference,
    setSelectedSongSlideReference,
    selectedSongText,
  ]);

  const gotoPreviousSlide = useCallback(() => {
    if (!selectedSongSlideReference || !selectedSongText) return;
    const { partIndex, slideIndex } = selectedSongSlideReference;

    if (selectedSongText[partIndex]?.slides[slideIndex - 1]) {
      setSelectedSongSlideReference({ partIndex, slideIndex: slideIndex - 1 });
      return;
    }
    const prevSlides = selectedSongText[partIndex - 1]?.slides;
    if (prevSlides && prevSlides[prevSlides.length - 1]) {
      setSelectedSongSlideReference({
        partIndex: partIndex - 1,
        slideIndex: prevSlides.length - 1,
      });
      return;
    }
  }, [
    selectedSongSlideReference,
    setSelectedSongSlideReference,
    selectedSongText,
  ]);

  const clearSong = useCallback(() => {
    setSelectedSong(null);
    setSelectedSongSlideReference(null);
  }, [setSelectedSong, setSelectedSongSlideReference]);

  return { gotoNextSlide, gotoPreviousSlide, clearSong };
};

export const useManageSongs = () => {
  const [selectedSong] = useAtom(selectedSongAtom);
  const [, setSelectedSongSlideReference] = useAtom(
    selectedSongSlideReferenceAtom,
  );
  useEffect(() => {
    if (selectedSong)
      setSelectedSongSlideReference({ partIndex: 0, slideIndex: 0 });
  }, [selectedSong, setSelectedSongSlideReference]);
};

export const useImportNativeFormatSongs = () => {
  const { mutate: createSong } = trpc.useMutation(['createSong']);
  const nativeFormatSongs = useLocalSongs();
  const firstSong = nativeFormatSongs[0];

  const importSongs = useCallback(() => {
    createSong(firstSong);
  }, [createSong, firstSong]);

  return importSongs;
};

export const useServerSongs = () => {
  const rawServerSongs = trpc.useQuery(['getSongs']);
  const songs: TClientSong[] = useMemo(
    () => rawServerSongs.data?.allSongs.map(mapServerSongToClientSong) ?? [],
    [rawServerSongs],
  );

  return { serverSongs: songs };
};
