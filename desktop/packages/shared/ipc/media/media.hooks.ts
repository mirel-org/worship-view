import { useEffect, useState } from 'react';
import { getNodeApiClient } from '..';
import { MediaItem } from './media.types';

const useGetMediaItems = () => {
  const { getMediaItems } = getNodeApiClient();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  useEffect(() => {
    getMediaItems().then((mediaItems) => setMediaItems(mediaItems));
  }, [getMediaItems]);
  return mediaItems;
};

export default useGetMediaItems;
