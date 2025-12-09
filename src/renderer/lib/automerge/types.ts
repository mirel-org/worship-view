// Automerge document types
export type UUID = string;

export interface AutomergeSong {
  id: UUID;
  name: string;
  fullText: string;
}

export interface AutomergeServiceListItem {
  songId: UUID;
  position: number;
}

export interface AutomergeDocument {
  songs: { [key: UUID]: AutomergeSong };
  serviceList: AutomergeServiceListItem[];
}

