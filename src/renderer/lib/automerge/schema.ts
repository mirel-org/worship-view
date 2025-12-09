import { AutomergeDocument } from './types';

// Export AutomergeDocument for use in other files
export type { AutomergeDocument };

// Initial empty document schema
export function createEmptyDocument(): AutomergeDocument {
  return {
    songs: {},
    serviceList: [],
  };
}

