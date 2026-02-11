import type { MediaItemResponse } from '@renderer/lib/jazz/media-store';
import { useMediaBlobUrl } from '@renderer/hooks/useMedia';
import { FC, useRef, useEffect } from 'react';

type MediaBoxProps = {
  mediaItem: MediaItemResponse;
};

const MediaBox: FC<MediaBoxProps> = ({ mediaItem }) => {
  const { blobUrl } = useMediaBlobUrl(mediaItem.fileStreamId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video plays
    const playVideo = () => {
      if (video.paused) {
        video.play().catch(console.error);
      }
    };

    video.addEventListener('canplay', playVideo);
    video.addEventListener('loadeddata', playVideo);

    return () => {
      video.removeEventListener('canplay', playVideo);
      video.removeEventListener('loadeddata', playVideo);
      // Cleanup on unmount
      video.pause();
      video.src = '';
    };
  }, []);

  if (!blobUrl) return null;

  return (
    <div className='w-full h-full'>
      {mediaItem.mediaType === 'image' && (
        <img src={blobUrl} className='w-full h-auto' alt={mediaItem.name} />
      )}
      {mediaItem.mediaType === 'video' && (
        <video
          ref={videoRef}
          src={blobUrl}
          autoPlay
          muted
          playsInline
          loop
          preload='auto'
          className='w-full h-full object-cover'
        />
      )}
    </div>
  );
};

export default MediaBox;
