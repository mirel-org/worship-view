import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Display } from 'electron';
import { getApiClient } from '../index';
import { availableDisplaysAtom, mainWindowDisplayIdAtom } from './display.atoms';

const useGetDisplays = () => {
  const { getDisplays, getMainWindowDisplayId, onDisplaysChanged } =
    getApiClient();
  const [, setAvailableDisplays] = useAtom(availableDisplaysAtom);
  const [, setMainWindowDisplayId] = useAtom(mainWindowDisplayIdAtom);

  useEffect(() => {
    getDisplays().then((displays: Display[]) => {
      setAvailableDisplays(displays);
    });
    getMainWindowDisplayId().then((id: number) => {
      setMainWindowDisplayId(id);
    });
  }, [getDisplays, getMainWindowDisplayId, setAvailableDisplays, setMainWindowDisplayId]);

  useEffect(() => {
    const cleanup = onDisplaysChanged((displays: Display[]) => {
      setAvailableDisplays(displays);
      getMainWindowDisplayId().then((id: number) => {
        setMainWindowDisplayId(id);
      });
    });
    return cleanup;
  }, [onDisplaysChanged, getMainWindowDisplayId, setAvailableDisplays, setMainWindowDisplayId]);
};

export default useGetDisplays;
