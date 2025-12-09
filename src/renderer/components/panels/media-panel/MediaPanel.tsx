import { selectedBackgroundMediaItemAtom } from '@ipc/media/media.atoms';
import useGetMediaItems from '@ipc/media/media.hooks';
import { useAtom } from 'jotai';
import { FC } from 'react';

const MediaPanel: FC = () => {
  const mediaItems = useGetMediaItems();
  const [, setSelectedMediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden p-4">
      <ul className="space-y-1">
        {mediaItems.map((mediaItem) => (
          <li
            key={mediaItem.id}
            onClick={() => setSelectedMediaItem(mediaItem)}
            className="cursor-pointer hover:bg-accent rounded-md p-2 transition-colors"
          >
            <span>{mediaItem.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MediaPanel;
