import React, { FC } from 'react';
import styled from 'styled-components';

type VerseSlideProps = {
  text: string;
  reference: string;
};

const VerseSlide: FC<VerseSlideProps> = ({ text, reference }) => {
  return (
    <Container>
      <Text>{text}</Text>
      <Reference>{reference}</Reference>
    </Container>
  );
};

export default VerseSlide;

const Container = styled.div`
  width: 80%;
`;

const Text = styled.div`
  font-family: 'Montserrat';
  font-size: 450%;
  font-weight: 700;
  font-style: italic;
  color: white;
  text-shadow: 0.08em 0.08em 0 black;
  text-align: center;
`;

const Reference = styled.div`
margin-top: 32px;
  font-family: 'Montserrat';
  font-size: 350%;
  font-weight: 700;
  font-style: italic;
  text-transform: uppercase;
  color: white;
  text-shadow: 0.06em 0.06em 1px #00000094;
  text-align: right;
`;
