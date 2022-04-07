import { prayerRequestsAtom } from '@ipc/prayer/prayer.atoms';
import { TextField } from '@mui/material';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const TabsPrayer = () => {
  const [inputValue, setInputValue] = useState('');
  const [, setPrayerRequests] = useAtom(prayerRequestsAtom);
  useEffect(() => {
    setPrayerRequests(inputValue.split('\n'));
    console.log(inputValue.split('\n'));
  }, [inputValue, setPrayerRequests]);

  return (
    <Wrapper>
      <TextField
        label='Prayer requests (one per line)'
        multiline
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
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
