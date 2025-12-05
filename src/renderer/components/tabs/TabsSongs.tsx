import React, { FC } from 'react';
import MediaPanel from '../panels/media-panel/MediaPanel';
import SlidesListPanel from '../panels/slides-list-panel/SlidesListPanel';
import SongsListPanel from '../panels/songs-list-panel/SongsListPanel';

const TabsSongs: FC = () => {
  return (
    <div className="flex h-full">
      <div className="w-[300px] flex-none">
        <div className="h-[50%]">
          <SongsListPanel />
        </div>
        <div className="h-[50%]">
          <MediaPanel />
        </div>
      </div>
      <div className="flex-1">
        <SlidesListPanel />
      </div>
    </div>
  );
};

export default TabsSongs;
