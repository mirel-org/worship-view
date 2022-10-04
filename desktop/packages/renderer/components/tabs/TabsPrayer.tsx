import {
  prayerRequestFontSizeAtom,
  prayerRequestsAtom,
} from '@ipc/prayer/prayer.atoms';
import { useAtom } from 'jotai';
import { OliButton, OliTextarea } from 'oli-design-system';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const TabsPrayer = () => {
  const [inputValue, setInputValue] = useState('');
  const [, setPrayerRequests] = useAtom(prayerRequestsAtom);
  const [, setPrauerRequestFontSize] = useAtom(prayerRequestFontSizeAtom);
  useEffect(() => {
    setPrayerRequests(inputValue.split('\n'));
    console.log(inputValue.split('\n'));
  }, [inputValue, setPrayerRequests]);

  return (
    <Wrapper>
      <OliButton
        text='Increase font size'
        onClick={() => setPrauerRequestFontSize((fontSize) => fontSize + 25)}
      />
      <OliButton
        onClick={() => setPrauerRequestFontSize((fontSize) => fontSize - 25)}
        text='Decrease font size'
      />
      <OliTextarea
        label='Prayer requests (one per line)'
        multiline
        value={inputValue}
        onChange={(v) => setInputValue(v)}
        variant='filled'
        fullWidth
      />
    </Wrapper>
  );
};

export default TabsPrayer;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;
