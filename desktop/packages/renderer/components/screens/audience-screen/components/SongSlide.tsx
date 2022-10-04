import { FC } from 'react';
import styled from 'styled-components';

type SongSlideProps = {
  lines: string[];
};

const SongSlide: FC<SongSlideProps> = ({ lines }) => {
  return (
    <Container>
      {lines.map((line, index) => (
        <Text key={index}>{line}</Text>
      ))}
    </Container>
  );
};

export default SongSlide;

const Container = styled.div``;

const Text = styled.div`
  font-family: 'Montserrat';
  font-size: 410%;
  font-weight: 700;
  font-style: italic;
  text-transform: uppercase;
  color: white;
  text-shadow: 0.06em 0.06em 1px #00000094;
  text-align: center;
  /* background-color: #000000b9;
  padding: 0 16px; */
`;
