export type LibreOfficeCheckResult = {
  installed: boolean;
  path?: string;
};

export type ExtractedVideo = {
  slideIndex: number;
  mimeType: string;
  data: ArrayBuffer;
};

export type PreparePresentationResult = {
  name: string;
  pdfData: ArrayBuffer;
  videos: ExtractedVideo[];
};

export type ConvertedSlide = {
  index: number;
  type: 'image' | 'video';
  mimeType: string;
  data: ArrayBuffer;
};

export type PresentationPreloadType = {
  checkLibreOffice: () => Promise<LibreOfficeCheckResult>;
  preparePresentation: (filePath: string) => Promise<PreparePresentationResult>;
  selectPptxFile: () => Promise<string | null>;
};

export const PresentationChannels = {
  checkLibreOffice: 'presentation.checkLibreOffice',
  preparePresentation: 'presentation.preparePresentation',
  selectPptxFile: 'presentation.selectPptxFile',
};
