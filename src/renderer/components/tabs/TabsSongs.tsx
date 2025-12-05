import React, { FC } from 'react';
import styled from 'styled-components';
import MediaPanel from '../panels/media-panel/MediaPanel';
import SlidesListPanel from '../panels/slides-list-panel/SlidesListPanel';
import SongsListPanel from '../panels/songs-list-panel/SongsListPanel';

const TabsSongs: FC = () => {
  return (
    <Wrapper>
      <SidePanels>
        <FirstPanel>
          <SongsListPanel />
        </FirstPanel>
        <SecondPanel>
          <MediaPanel />
        </SecondPanel>
      </SidePanels>
      <Main>
        <SlidesListPanel />
      </Main>
    </Wrapper>
  );
};

export default TabsSongs;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
`;

const SidePanels = styled.div`
  width: 300px;
  flex: none;
`;

const Main = styled.div`
  flex: 1;
`;

const FirstPanel = styled.div`
  height: 50%;
`;

const SecondPanel = styled.div`
  height: 50%;
`;
