import styled from 'styled-components';
import BibleSearchPanel from '../panels/bible-search-panel/BibleSearchPanel';
import { BibleVersesHistory } from '../panels/bible-verses-history/BibleVersesHistory';
import VersesPanel from '../panels/verses-panel/VersesPanel';

const TabsBible = () => {
  return (
    <Wrapper>
      <BibleSearchPanel />
      <Container>
        <SidePanels>
          <BibleVersesHistory />
        </SidePanels>
        <Main>
          <VersesColumn>
            <VersesPanel />
          </VersesColumn>
        </Main>
      </Container>
    </Wrapper>
  );
};

export default TabsBible;

const VersesColumn = styled.div`
  width: 90%;
  height: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const Container = styled.div`
  display: flex;
  height: 85%;
`;

const SidePanels = styled.div`
  width: 300px;
  flex: none;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
