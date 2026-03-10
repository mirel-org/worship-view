import { FC, useRef } from 'react';
import { useAtom } from 'jotai';
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
import {
  videoPlayingAtom,
  videoVolumeAtom,
  videoSeekRequestAtom,
  videoCurrentTimeAtom,
  videoDurationAtom,
} from '../../../state/presentation.atoms';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const VideoControls: FC = () => {
  const [isPlaying, setIsPlaying] = useAtom(videoPlayingAtom);
  const [volume, setVolume] = useAtom(videoVolumeAtom);
  const [, setSeekRequest] = useAtom(videoSeekRequestAtom);
  const [currentTime] = useAtom(videoCurrentTimeAtom);
  const [duration] = useAtom(videoDurationAtom);
  const preMuteVolumeRef = useRef(1);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const toggleMute = () => {
    if (volume > 0) {
      preMuteVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(preMuteVolumeRef.current || 1);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="border-t border-border px-4 py-3 space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-foreground" />
          ) : (
            <Play className="w-4 h-4 text-foreground ml-0.5" />
          )}
        </button>
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={(e) => setSeekRequest(parseFloat(e.target.value))}
        disabled={!duration}
        className="video-range-progress w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer disabled:opacity-40 disabled:cursor-default"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent transition-colors"
        >
          <VolumeIcon className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="video-range-volume w-24 h-1 rounded-full appearance-none bg-muted cursor-pointer"
        />
      </div>
    </div>
  );
};

export default VideoControls;
