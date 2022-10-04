import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { getNodeApiClient } from '..';
import { availableDisplaysAtom } from './display.atoms';

const useGetDisplays = () => {
  const { getDisplays } = getNodeApiClient();
  const [, setAvailableDisplays] = useAtom(availableDisplaysAtom);
  useEffect(() => {
    getDisplays().then((displays) => {
      setAvailableDisplays(displays);
    });
  }, [getDisplays, setAvailableDisplays]);
};

export default useGetDisplays;
