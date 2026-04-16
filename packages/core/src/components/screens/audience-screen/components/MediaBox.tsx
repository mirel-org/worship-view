import type { MediaItemResponse } from '../../../../jazz/media-store';
import { useMediaBlobUrl, useMediaItemAssetBlobUrl } from '../../../../hooks/useMedia';
import { isVideoEnabled } from '../../../../config/video-feature';
import { FC, useRef, useEffect } from 'react';

type MediaBoxProps = {
  mediaItem: MediaItemResponse;
};

const MediaBox: FC<MediaBoxProps> = ({ mediaItem }) => {
  const showVideo = mediaItem.mediaType === 'video' && isVideoEnabled();
  const posterStreamId =
    mediaItem.mediaType === 'video' && !showVideo
      ? mediaItem.previewFileStreamId
      : undefined;

  // Only load the full video blob when we'll actually play it;
  // otherwise just load the lightweight poster image.
  const mainAssetId =
    mediaItem.mediaType === 'image' || showVideo
      ? mediaItem.assetId
      : undefined;

  const { blobUrl } = useMediaItemAssetBlobUrl({
    assetId: mainAssetId,
    mediaItemId: mediaItem.id,
  });
  const { blobUrl: posterUrl } = useMediaBlobUrl(posterStreamId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
      video.pause();
      video.src = '';
    };
  }, []);

  if (!blobUrl && !posterUrl) return null;

  return (
    <div className='w-full h-full'>
      {mediaItem.mediaType === 'image' && blobUrl && (
        <img src={blobUrl} className='w-full h-auto' alt={mediaItem.name} />
      )}
      {mediaItem.mediaType === 'video' && showVideo && blobUrl && (
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
      {mediaItem.mediaType === 'video' && !showVideo && posterUrl && (
        <img src={posterUrl} className='w-full h-full object-cover' alt={mediaItem.name} />
      )}
    </div>
  );
};

export default MediaBox;
