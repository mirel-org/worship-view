import React, { FC } from 'react';
import styled from 'styled-components';
import BibleSearchPanel from '../panels/bible-search-panel/BibleSearchPanel';
import VersesPanel from '../panels/verses-panel/VersesPanel';

const TabsBible: FC = () => {
  return (
    <Wrapper>
      <BibleSearchPanel />
      <VersesColumn>
        <VersesPanel />
      </VersesColumn>
    </Wrapper>
  );
};

export default TabsBible;

const VersesColumn = styled.div`
  width: 60%;
  height: 85%;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%
`;
