import { selectedBackgroundMediaItemAtom } from '../../../../state/media.atoms';
import MediaBox from './MediaBox';
import { useAtom } from 'jotai';
import { FC } from 'react';
import CrossFade from './CrossFade';

const MediaBackground: FC = () => {
  const [mediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  return (
    <div className="absolute z-0 h-full w-full">
      <CrossFade nodeKey={mediaItem?.id ?? null}>
        {mediaItem && <MediaBox mediaItem={mediaItem} />}
      </CrossFade>
    </div>
  );
};

export default MediaBackground;
