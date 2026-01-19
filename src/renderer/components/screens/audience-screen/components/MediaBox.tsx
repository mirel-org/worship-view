import { MediaItem } from '@ipc/media/media.types';
import { FC, useRef, useEffect } from 'react';

type MediaBoxProps = {
  mediaItem: MediaItem;
};

const MediaBox: FC<MediaBoxProps> = ({ mediaItem }) => {
  const fileUrl = `local-files://media/${mediaItem.name}`;
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

  return (
    <div className='w-full h-full'>
      {mediaItem.type === 'image' && (
        <img src={fileUrl} className='w-full h-auto' alt={mediaItem.name} />
      )}
      {mediaItem.type === 'video' && (
        <video
          ref={videoRef}
          src={fileUrl}
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
