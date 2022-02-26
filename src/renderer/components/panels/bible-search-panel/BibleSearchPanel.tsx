import React, { FC } from 'react';
import { useAtom } from 'jotai';
import { TextField } from '@mui/material';
import styled from 'styled-components';
import {
  verseInputFocusAtom,
  verseInputValueAtom,
} from '@ipc/verse/verse.atoms';
import useInputFocus from '@renderer/hooks/useInputFocus';

const BibleSearch: FC = () => {
  const [value, setValue] = useAtom(verseInputValueAtom);
  const [focused, setFocused] = useAtom(verseInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  return (
    <Container>
      <TextField
        label='Search verse'
        variant='outlined'
        onBlur={focusProps.onBlur}
        onFocus={focusProps.onFocus}
        inputRef={focusProps.ref}
        value={value}
        onChange={(ev) => setValue(ev.target.value)}
      />
    </Container>
  );
};

export default BibleSearch;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;
