import React, { FC } from 'react';
import styled from 'styled-components';

type SlidesListItemProps = {
  lines: string[];
  onClick: () => void;
  selected: boolean;
};

const SlidesListItem: FC<SlidesListItemProps> = ({
  lines,
  onClick,
  selected,
}) => {
  return (
    <Container selected={selected} onClick={onClick}>
      <div>
        {lines.map((line, index) => (
          <Text key={`${line} ${index}`}>{line}</Text>
        ))}
      </div>
    </Container>
  );
};

export default SlidesListItem;

const Container = styled.div<{ selected: boolean }>`
  outline: ${(props) => (props.selected ? 'red solid 4px' : 'none')};
  background-color: black;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  cursor: pointer;
  padding: 8px 0;
`;

const Text = styled.div`
  font-family: 'Montserrat';
  font-size: 80%;
  font-weight: 700;
  font-style: italic;
  text-transform: uppercase;
  color: white;
  text-shadow: 0.1em 0.1em 0 hsl(200 50% 30%);
`;
