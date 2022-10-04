import { FC } from 'react';
import styled from 'styled-components';

type VerseSlideProps = {
  text: string;
  reference: string;
  isStage?: boolean;
};

const VerseSlide: FC<VerseSlideProps> = ({
  text,
  reference,
  isStage = false,
}) => {
  const fontSize = (400 / text.length) * 100 + 500;
  return (
    <Container isStage={isStage}>
      {isStage ? (
        <StageText fontSize={fontSize}>{text}</StageText>
      ) : (
        <AudienceText>{text}</AudienceText>
      )}
      <Reference>{reference}</Reference>
    </Container>
  );
};

export default VerseSlide;

const Container = styled.div<{ isStage: boolean }>`
  width: ${(props) => (props.isStage ? '95%' : '80%')};
`;

const AudienceText = styled.div`
  font-family: 'Montserrat';
  font-size: 450%;
  font-weight: 700;
  font-style: italic;
  color: white;
  text-shadow: 0.08em 0.08em 0 black;
  text-align: center;
`;

const StageText = styled.div<{ fontSize: number }>`
  font-family: 'Iosevka';
  font-size: ${(props) => `${props.fontSize}%`};
  color: white;
  text-align: center;
  line-height: 1;
  letter-spacing: -0.1em;
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
