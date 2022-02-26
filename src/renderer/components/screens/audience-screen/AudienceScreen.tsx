import React, { FC } from 'react';
import styled from 'styled-components';
import MediaBackground from './components/MediaBackground';
import SlideText from './components/SlideText';

const AudienceScreen: FC = () => {
  return (
    <Container>
      <SlideText />
      <MediaBackground />
    </Container>
  );
};

export default AudienceScreen;

const Container = styled.div`
  background-color: black;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
