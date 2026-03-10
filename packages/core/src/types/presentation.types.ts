export type PresentationSlideData = {
  index: number;
  type: 'image' | 'video';
  mimeType: string;
  fileStreamId: string;
};

export type PresentationData = {
  id: string;
  name: string;
  slideCount: number;
  slides: PresentationSlideData[];
};
