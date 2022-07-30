import { MediaItem } from '@ipc/media/media.types';
import React, { FC } from 'react';
import styled from 'styled-components';

type MediaBoxProps = {
  mediaItem: MediaItem;
};

const MediaBox: FC<MediaBoxProps> = ({ mediaItem }) => {
  return (
    <Container>
      {mediaItem.type === 'image' && (
        <Img src={`local-files://media/${mediaItem.name}`} />
      )}
      {mediaItem.type === 'video' && (
        <Video autoPlay loop>
          <source src={`local-files://media/${mediaItem.name}`} />
        </Video>
      )}
    </Container>
  );
};

export default MediaBox;

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
  width: 100%    !important;
  height: auto   !important;
`;

const Img = styled.img`
  width: 100%    !important;
  height: auto   !important;
`;