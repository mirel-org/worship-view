import { MediaItem } from '@ipc/media/media.types';
import React, { FC } from 'react';

type MediaBoxProps = {
  mediaItem: MediaItem;
};

const MediaBox: FC<MediaBoxProps> = ({ mediaItem }) => {
  return (
    <div className="w-full h-full">
      {mediaItem.type === 'image' && (
        <img
          src={`local-files://media/${mediaItem.name}`}
          className="w-full h-auto"
          alt={mediaItem.name}
        />
      )}
      {mediaItem.type === 'video' && (
        <video
          autoPlay
          loop
          className="w-full h-full object-cover"
        >
          <source src={`local-files://media/${mediaItem.name}`} />
        </video>
      )}
    </div>
  );
};

export default MediaBox;
