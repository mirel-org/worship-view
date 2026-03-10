import { useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedTextStyleIdAtom } from '../state/text-style.atoms';
import { settingsSongSlideSizeAtom } from '../state/settings.song.atoms';
import { useActiveOrganization } from './useActiveOrganization';
import {
  getTextStyles,
  getTextStyleById,
  FALLBACK_TEXT_STYLE,
} from '../jazz/text-style-store';
import type { TextStyleData } from '../jazz/text-style-store';

/**
 * Hook to resolve the active text style.
 * Falls back to the first style in the list when no style selected.
 * Falls back to FALLBACK_TEXT_STYLE when org not loaded.
 * Also syncs songSlideSize to the settingsSongSlideSizeAtom so derived atoms react.
 */
export function useActiveTextStyle(): TextStyleData {
  const { activeOrganization } = useActiveOrganization();
  const [selectedTextStyleId] = useAtom(selectedTextStyleIdAtom);
  const [, setSongSlideSize] = useAtom(settingsSongSlideSizeAtom);

  const style = useMemo(() => {
    if (!activeOrganization) return FALLBACK_TEXT_STYLE;

    const styles = getTextStyles(activeOrganization);
    if (styles.length === 0) return FALLBACK_TEXT_STYLE;

    if (selectedTextStyleId) {
      const found = getTextStyleById(activeOrganization, selectedTextStyleId);
      if (found) return found;
    }

    // No selection or selection not found — use first style
    return styles[0];
  }, [selectedTextStyleId, activeOrganization]);

  // Keep the song slide size atom in sync with the active text style
  useEffect(() => {
    setSongSlideSize(style.songSlideSize);
  }, [style.songSlideSize, setSongSlideSize]);

  return style;
}

/**
 * Hook to get all text styles and selection state for the settings UI.
 */
export function useTextStyles() {
  const { activeOrganization } = useActiveOrganization();
  const [selectedStyleId, setSelectedStyleId] = useAtom(selectedTextStyleIdAtom);

  const styles = useMemo(() => {
    return getTextStyles(activeOrganization);
  }, [activeOrganization]);

  return {
    styles,
    selectedStyleId,
    setSelectedStyleId,
    activeOrganization,
  };
}
