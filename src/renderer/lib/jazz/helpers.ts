import { Group } from 'jazz-tools';
import { OrganizationType, SongType, ServiceListItemType, MediaItemType } from './schema';
import { OrganizationWithOwner, CoMapWithSet } from './types';

/**
 * Helper functions with proper types to avoid 'as unknown' assertions
 */

/**
 * Get the owner group from an organization
 */
export function getOrganizationGroup(organization: OrganizationType): Group {
  const org = organization as OrganizationWithOwner;
  return org.$jazz.owner || Group.create();
}

/**
 * Set a property on a CoMap
 */
export function setCoMapProperty<T extends CoMapWithSet>(
  coMap: T,
  key: string,
  value: unknown,
): void {
  coMap.$jazz.set(key, value);
}

/**
 * Push an item to a CoList
 * Handles MaybeLoaded types by checking if loaded
 */
export function pushCoListItem<T>(coList: any, item: T): void {
  if (coList && coList.$jazz && typeof coList.$jazz.push === 'function') {
    coList.$jazz.push(item);
  } else {
    throw new Error('CoList is not loaded or does not support push');
  }
}

/**
 * Remove items from a CoList
 * Handles MaybeLoaded types and Jazz's remove signature
 */
export function removeCoListItem<T>(
  coList: any,
  predicate: (item: T | null) => boolean,
): void {
  if (coList && coList.$jazz && typeof coList.$jazz.remove === 'function') {
    // Jazz's remove accepts a predicate with (item, index, coList) signature
    // but we can adapt our simpler predicate
    coList.$jazz.remove((item: T | null, _index?: number, _coList?: unknown) =>
      predicate(item),
    );
  } else {
    throw new Error('CoList is not loaded or does not support remove');
  }
}

/**
 * Type guard to check if a CoList is loaded as an array
 */
export function isCoListLoaded<T>(value: unknown): value is (T | null)[] {
  return Array.isArray(value);
}

/**
 * Get songs from organization as an array (when loaded)
 */
export function getSongsArray(
  organization: OrganizationType | null | undefined,
): (SongType | null)[] {
  if (!organization?.songs) return [];
  if (isCoListLoaded<SongType>(organization.songs)) {
    return organization.songs;
  }
  return [];
}

/**
 * Get media from organization as an array (when loaded)
 */
export function getMediaArray(
  organization: OrganizationType | null | undefined,
): (MediaItemType | null)[] {
  if (!organization?.media) return [];
  if (isCoListLoaded<MediaItemType>(organization.media)) {
    return organization.media;
  }
  return [];
}

/**
 * Get service list from organization as an array (when loaded)
 */
export function getServiceListArray(
  organization: OrganizationType | null | undefined,
): (ServiceListItemType | null)[] {
  if (!organization?.serviceList) return [];
  if (isCoListLoaded<ServiceListItemType>(organization.serviceList)) {
    return organization.serviceList;
  }
  return [];
}
