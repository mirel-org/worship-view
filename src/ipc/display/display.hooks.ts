import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Display } from 'electron';
import { getApiClient } from '..';
import { availableDisplaysAtom } from './display.atoms';

const useGetDisplays = () => {
  const { getDisplays } = getApiClient();
  const [, setAvailableDisplays] = useAtom(availableDisplaysAtom);
  useEffect(() => {
    getDisplays().then((displays: Display[]) => {
      setAvailableDisplays(displays);
    });
  }, [getDisplays, setAvailableDisplays]);
};

export default useGetDisplays;
