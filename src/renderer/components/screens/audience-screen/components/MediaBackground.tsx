import { selectedBackgroundMediaItemAtom } from '@ipc/media/media.atoms';
import MediaBox from '@renderer/components/screens/audience-screen/components/MediaBox';
import { useAtom } from 'jotai';
import { FC } from 'react';
import CrossFade from './CrossFade';

const MediaBackground: FC = () => {
  const [mediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  return (
    <div className="absolute z-0 h-full w-full">
      <CrossFade nodeKey={mediaItem?.name ?? null}>
        {mediaItem && <MediaBox mediaItem={mediaItem} />}
      </CrossFade>
    </div>
  );
};

export default MediaBackground;
