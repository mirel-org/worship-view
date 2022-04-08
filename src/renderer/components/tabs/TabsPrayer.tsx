import {
  prayerRequestFontSizeAtom,
  prayerRequestsAtom,
} from '@ipc/prayer/prayer.atoms';
import { Button, TextField } from '@mui/material';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

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
      <Button
        variant='outlined'
        startIcon={<AddIcon />}
        onClick={() => setPrauerRequestFontSize((fontSize) => fontSize + 25)}
      >
        Increase font size
      </Button>
      <Button
        variant='outlined'
        startIcon={<RemoveIcon />}
        onClick={() => setPrauerRequestFontSize((fontSize) => fontSize - 25)}
      >
        Decrease font size
      </Button>
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
