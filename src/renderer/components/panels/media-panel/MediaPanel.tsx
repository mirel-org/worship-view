import { selectedBackgroundMediaItemAtom } from '@ipc/media/media.atoms';
import useGetMediaItems from '@ipc/media/media.hooks';
import { useAtom } from 'jotai';
import { FC } from 'react';

const MediaPanel: FC = () => {
  const mediaItems = useGetMediaItems();
  const [, setSelectedMediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  return (
    <div className="overflow-y-auto overflow-x-hidden h-full">
      <h2 className="text-2xl font-semibold mb-4 p-4">Media</h2>
      <ul className="space-y-1 px-4">
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
