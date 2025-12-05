import { FC } from 'react';
import { useAtom } from 'jotai';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="flex items-center justify-center p-4">
      <div className="space-y-2 w-full max-w-md">
        <Label htmlFor="search-verse">Search verse</Label>
        <Input
          id="search-verse"
          placeholder="Search verse"
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
