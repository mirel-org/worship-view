import { useEffect, useState } from 'react';
import { getApiClient } from '..';
import { MediaItem } from './media.types';

const useGetMediaItems = () => {
  const { getMediaItems } = getApiClient();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  useEffect(() => {
    getMediaItems().then((mediaItems) => setMediaItems(mediaItems));
  }, [getMediaItems]);
  return mediaItems;
};

export default useGetMediaItems;
