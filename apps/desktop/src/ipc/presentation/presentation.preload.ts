import { ipcRenderer } from 'electron';
import { PresentationChannels, PresentationPreloadType } from './presentation.types';

const presentationPreload: PresentationPreloadType = {
  checkLibreOffice: () =>
    ipcRenderer.invoke(PresentationChannels.checkLibreOffice),
  preparePresentation: (filePath: string) =>
    ipcRenderer.invoke(PresentationChannels.preparePresentation, filePath),
  selectPptxFile: () =>
    ipcRenderer.invoke(PresentationChannels.selectPptxFile),
};

export default presentationPreload;
