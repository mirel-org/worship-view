import { FC } from 'react';
import { useAtom } from 'jotai';
import { Input } from '@worship-view/ui';
import { Label } from '@worship-view/ui';
import {
  verseInputFocusAtom,
  verseInputValueAtom,
} from '../../../state/verse.atoms';
import useInputFocus from '../../../hooks/useInputFocus';

const BibleSearch: FC = () => {
  const [value, setValue] = useAtom(verseInputValueAtom);
  const [focused, setFocused] = useAtom(verseInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="space-y-2 w-full max-w-md">
        <Label htmlFor="search-verse">Caută verset</Label>
        <Input
          id="search-verse"
          placeholder="Caută verset"
          onBlur={focusProps.onBlur}
          onFocus={focusProps.onFocus}
          ref={focusProps.ref}
          value={value}
          onChange={(ev) => setValue(ev.target.value)}
        />
      </div>
    </div>
  );
};

export default BibleSearch;
