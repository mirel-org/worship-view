import { Group } from 'jazz-tools';

/**
 * Type definitions for Jazz runtime properties
 * These properties exist at runtime but aren't always in TypeScript definitions
 */

/**
 * Base interface for CoValue runtime properties
 */
export interface CoValueJazz {
  id: string;
  owner: Group;
  has(key: string): boolean;
  set(key: string, value: unknown): void;
  ensureLoaded(options?: { resolve?: unknown }): Promise<unknown>;
}

/**
 * Interface for CoList runtime properties
 */
export interface CoListJazz<T> {
  push(item: T): void;
  unshift(item: T): void;
  remove(predicate: (item: T | null) => boolean): void;
  set(index: number, item: T): void;
}

/**
 * Type helper to get the $jazz property from a CoValue
 */
export type WithJazz<T> = T & {
  $jazz: CoValueJazz;
};

/**
 * Type helper to get the $jazz property from a CoList
 */
export type CoListWithJazz<T> = T & {
  $jazz: CoListJazz<T extends (infer U)[] ? U : never>;
};

/**
 * Type helper for accessing organization's owner group
 */
export interface OrganizationWithOwner {
  $jazz: {
    owner: Group;
  };
}

/**
 * Type helper for CoMap with set method
 */
export interface CoMapWithSet {
  $jazz: {
    set(key: string, value: unknown): void;
  };
}

/**
 * Type helper for CoList with push method
 */
export interface CoListWithPush<T> {
  $jazz: {
    push(item: T): void;
  };
}

/**
 * Type helper for CoList with remove method
 */
export interface CoListWithRemove<T> {
  $jazz: {
    remove(predicate: (item: T | null) => boolean): void;
  };
}
