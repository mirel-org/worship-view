export type MediaItem = {
  id: number;
  name: string;
  type: MediaType;
};

export type MediaType = "video" | "image";

export type MediaPreloadType = {
  getMediaItems: () => Promise<MediaItem[]>;
};

export const MediaChannels = {
  getMediaItems: 'media.get-media-items',
};
