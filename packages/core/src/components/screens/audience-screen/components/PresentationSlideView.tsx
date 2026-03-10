import { FC, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { usePresentationSlideBlobUrl } from '../../../../hooks/usePresentation';
import {
  videoPlayingAtom,
  videoVolumeAtom,
  videoSeekRequestAtom,
  videoCurrentTimeAtom,
  videoDurationAtom,
} from '../../../../state/presentation.atoms';

type Props = {
  fileStreamId: string;
  slideType: 'image' | 'video';
};

const PresentationSlideView: FC<Props> = ({ fileStreamId, slideType }) => {
  const { blobUrl } = usePresentationSlideBlobUrl(fileStreamId);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useAtom(videoPlayingAtom);
  const [volume] = useAtom(videoVolumeAtom);
  const [seekRequest, setSeekRequest] = useAtom(videoSeekRequestAtom);
  const [, setCurrentTime] = useAtom(videoCurrentTimeAtom);
  const [, setDuration] = useAtom(videoDurationAtom);

  // Drive play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Drive volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  }, [volume]);

  // Drive seek
  useEffect(() => {
    const video = videoRef.current;
    if (seekRequest === null || !video) return;
    video.currentTime = seekRequest;
    setSeekRequest(null);
  }, [seekRequest, setSeekRequest]);

  // Report playback state back to atoms
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastUpdate = 0;
    const onTimeUpdate = () => {
      const now = performance.now();
      if (now - lastUpdate < 250) return;
      lastUpdate = now;
      setCurrentTime(video.currentTime);
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
    };
  }, [blobUrl, setCurrentTime, setDuration, setIsPlaying]);

  if (!blobUrl) return null;

  if (slideType === 'video') {
    return (
      <video
        ref={videoRef}
        src={blobUrl}
        autoPlay
        className="w-full h-full object-contain"
      />
    );
  }

  return (
    <img
      src={blobUrl}
      alt=""
      className="w-full h-full object-contain"
    />
  );
};

export default PresentationSlideView;
