import { useAtom } from 'jotai';
import styled from 'styled-components';
import {
  verseInputFocusAtom,
  verseInputValueAtom,
} from '@ipc/verse/verse.atoms';
import useInputFocus from '@renderer/hooks/useInputFocus';
import { OliInput } from 'oli-design-system';

const BibleSearch = () => {
  const [value, setValue] = useAtom(verseInputValueAtom);
  const [focused, setFocused] = useAtom(verseInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  return (
    <Container>
      <OliInput
        placeholder='Search verse'
        onBlur={focusProps.onBlur}
        onFocus={focusProps.onFocus}
        inputRef={focusProps.ref}
        value={value}
        onChange={(v) => setValue(v)}
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
