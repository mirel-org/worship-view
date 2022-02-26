import { selectedBackgroundMediaItemAtom } from '@ipc/media/media.atoms';
import MediaBox from '@renderer/components/screens/audience-screen/components/MediaBox';
import { useAtom } from 'jotai';
import React, { FC } from 'react';
import styled from 'styled-components';
import CrossFade from './CrossFade';

const MediaBackground: FC = () => {
  const [mediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  return (
    <Container>
      <CrossFade>{mediaItem && <MediaBox mediaItem={mediaItem} />}</CrossFade>
    </Container>
  );
};

export default MediaBackground;

const Container = styled.div`
  position: absolute;
  z-index: 0;
  height: 100%;
  width: 100%;
`;
