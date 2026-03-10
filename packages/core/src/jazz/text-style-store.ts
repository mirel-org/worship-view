import { v4 as uuidv4 } from 'uuid';
import {
  TextStyle,
  TextStyleType,
  OrganizationType,
  getOrganizationGroup,
  setCoMapProperty,
  pushCoListItem,
  removeCoListItem,
  getTextStylesArray,
} from '@worship-view/schema';
import type { SongSlideSize } from '../types/settings.song.types';

export type TextStyleData = {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  uppercase: boolean;
  fontColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowColor: string;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  songSlideSize: SongSlideSize;
};

/** Template used when creating the initial style for an organization. */
export const DEFAULT_TEXT_STYLE_TEMPLATE: Omit<TextStyleData, 'id'> = {
  name: 'Implicit',
  fontFamily: 'Montserrat',
  fontSize: 410,
  fontWeight: 700,
  italic: true,
  uppercase: true,
  fontColor: '#ffffff',
  shadowOffsetX: 0.06,
  shadowOffsetY: 0.06,
  shadowBlur: 1,
  shadowColor: '#00000094',
  lineHeight: 1.2,
  textAlign: 'center',
  songSlideSize: 4,
};

/** Last-resort fallback when no organization is loaded. */
export const FALLBACK_TEXT_STYLE: TextStyleData = {
  id: 'fallback',
  ...DEFAULT_TEXT_STYLE_TEMPLATE,
};

export const AVAILABLE_FONTS = [
  'Montserrat',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Trebuchet MS',
  'Impact',
];

function textStyleToData(item: TextStyleType | null | undefined): TextStyleData | null {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    fontFamily: item.fontFamily,
    fontSize: item.fontSize,
    fontWeight: item.fontWeight,
    italic: item.italic,
    uppercase: item.uppercase,
    fontColor: item.fontColor,
    shadowOffsetX: item.shadowOffsetX,
    shadowOffsetY: item.shadowOffsetY,
    shadowBlur: item.shadowBlur,
    shadowColor: item.shadowColor,
    lineHeight: item.lineHeight,
    textAlign: item.textAlign as 'left' | 'center' | 'right',
    songSlideSize: (item.songSlideSize === 0 ? 'full' : item.songSlideSize || 4) as SongSlideSize,
  };
}

export function getTextStyles(
  organization: OrganizationType | null | undefined,
): TextStyleData[] {
  const items = getTextStylesArray(organization);
  return items
    .map((item) => textStyleToData(item))
    .filter((r): r is TextStyleData => r !== null);
}

export function getTextStyleById(
  organization: OrganizationType | null | undefined,
  id: string,
): TextStyleData | null {
  const items = getTextStylesArray(organization);
  const item = items.find(
    (i: TextStyleType | null): i is TextStyleType => i !== null && i.id === id,
  );
  return textStyleToData(item);
}

export function createTextStyle(
  organization: OrganizationType | null | undefined,
  data: Omit<TextStyleData, 'id'>,
): TextStyleData {
  if (!organization) {
    throw new Error('No active organization');
  }

  const orgGroup = getOrganizationGroup(organization);
  const id = uuidv4();

  const newItem = TextStyle.create(
    {
      id,
      name: data.name,
      fontFamily: data.fontFamily,
      fontSize: data.fontSize,
      fontWeight: data.fontWeight,
      italic: data.italic,
      uppercase: data.uppercase,
      fontColor: data.fontColor,
      shadowOffsetX: data.shadowOffsetX,
      shadowOffsetY: data.shadowOffsetY,
      shadowBlur: data.shadowBlur,
      shadowColor: data.shadowColor,
      lineHeight: data.lineHeight,
      textAlign: data.textAlign,
      songSlideSize: data.songSlideSize === 'full' ? 0 : data.songSlideSize,
    },
    { owner: orgGroup },
  );

  // Ensure textStyles list exists
  if (!organization.textStyles) {
    setCoMapProperty(organization, 'textStyles', []);
  }
  pushCoListItem(organization.textStyles, newItem);

  const response = textStyleToData(newItem);
  if (!response) throw new Error('Failed to create text style');
  return response;
}

export function updateTextStyle(
  organization: OrganizationType | null | undefined,
  id: string,
  partial: Partial<Omit<TextStyleData, 'id'>>,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const items = getTextStylesArray(organization);
  const item = items.find(
    (i: TextStyleType | null): i is TextStyleType => i !== null && i.id === id,
  );
  if (!item) {
    throw new Error('Text style not found');
  }

  for (const [key, value] of Object.entries(partial)) {
    const storeValue = key === 'songSlideSize' && value === 'full' ? 0 : value;
    setCoMapProperty(item as any, key, storeValue);
  }
  return { success: true };
}

export function deleteTextStyle(
  organization: OrganizationType | null | undefined,
  id: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const items = getTextStylesArray(organization);
  const item = items.find(
    (i: TextStyleType | null): i is TextStyleType => i !== null && i.id === id,
  );
  if (!item) {
    throw new Error('Text style not found');
  }

  removeCoListItem(
    organization.textStyles,
    (i: TextStyleType | null) => i?.id === id,
  );

  return { success: true };
}

