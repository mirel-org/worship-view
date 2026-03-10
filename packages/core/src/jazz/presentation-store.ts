import { v4 as uuidv4 } from 'uuid';
import { co } from 'jazz-tools';
import {
  Presentation,
  PresentationSlide,
  PresentationType,
  PresentationSlideType,
  OrganizationType,
} from '@worship-view/schema';
import {
  getOrganizationGroup,
  setCoMapProperty,
  removeCoListItem,
  getPresentationsArray,
} from '@worship-view/schema';
import { normalizeForSearch } from '../utils/command.search.utils';

export type PresentationResponse = {
  id: string;
  name: string;
  slideCount: number;
  createdAt: number;
  slides: PresentationSlideResponse[];
};

export type PresentationSlideResponse = {
  index: number;
  slideType: 'image' | 'video';
  mimeType: string;
  fileStreamId: string;
};

function slideToResponse(
  slide: PresentationSlideType | null | undefined,
): PresentationSlideResponse | null {
  if (!slide) return null;
  const fileId = (slide.file as any)?.$jazz?.id ?? (slide.file as any)?.id;
  if (!fileId) return null;
  return {
    index: slide.index,
    slideType: slide.slideType as 'image' | 'video',
    mimeType: slide.mimeType,
    fileStreamId: fileId,
  };
}

function presentationToResponse(
  item: PresentationType | null | undefined,
): PresentationResponse | null {
  if (!item) return null;
  const slides: PresentationSlideResponse[] = [];
  if (item.slides && Array.isArray(item.slides)) {
    for (const slide of item.slides) {
      const resp = slideToResponse(slide);
      if (resp) slides.push(resp);
    }
  }
  return {
    id: item.id,
    name: item.name,
    slideCount: item.slideCount,
    createdAt: item.createdAt,
    slides,
  };
}

function getPresentationsFromOrg(
  organization: OrganizationType | null | undefined,
): PresentationType[] {
  const items = getPresentationsArray(organization);
  return items.filter(
    (item: PresentationType | null): item is PresentationType => item !== null,
  );
}

export function getPresentations(
  organization: OrganizationType | null | undefined,
): PresentationResponse[] {
  const items = getPresentationsFromOrg(organization);
  return items
    .map((item) => presentationToResponse(item))
    .filter((r): r is PresentationResponse => r !== null);
}

export type UploadSlideInput = {
  index: number;
  type: 'image' | 'video';
  mimeType: string;
  data: ArrayBuffer;
};

export async function uploadPresentation(
  organization: OrganizationType | null | undefined,
  name: string,
  slides: UploadSlideInput[],
  onProgress?: (progress: number) => void,
): Promise<PresentationResponse> {
  if (!organization) {
    throw new Error('No active organization');
  }

  const orgGroup = getOrganizationGroup(organization);
  const id = uuidv4();

  // Create slide CoMaps with FileStreams
  const slideCoMaps = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const blob = new Blob([slide.data], { type: slide.mimeType });
    const fileStream = await co.fileStream().createFromBlob(blob, {
      owner: orgGroup,
      onProgress: (p) => {
        if (onProgress) {
          const overall = (i + p) / slides.length;
          onProgress(overall);
        }
      },
    });

    const slideCoMap = PresentationSlide.create(
      {
        index: slide.index,
        slideType: slide.type,
        mimeType: slide.mimeType,
        file: fileStream,
      },
      { owner: orgGroup },
    );

    slideCoMaps.push(slideCoMap);
  }

  const presentation = Presentation.create(
    {
      id,
      name,
      searchText: normalizeForSearch(name),
      slideCount: slides.length,
      slides: slideCoMaps,
      createdAt: Date.now(),
    },
    { owner: orgGroup },
  );

  if (!organization.presentations) {
    throw new Error('Organization presentations not loaded');
  }
  (organization.presentations.$jazz as any).push(presentation);

  if (onProgress) onProgress(1);

  const response = presentationToResponse(presentation);
  if (!response) throw new Error('Failed to create presentation response');
  return response;
}

export function renamePresentation(
  organization: OrganizationType | null | undefined,
  id: string,
  newName: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const trimmed = newName.trim();
  if (!trimmed) {
    throw new Error('Presentation name cannot be empty');
  }

  const items = getPresentationsFromOrg(organization);
  const item = items.find((i) => i.id === id);
  if (!item) {
    throw new Error('Presentation not found');
  }

  setCoMapProperty(item as any, 'name', trimmed);
  setCoMapProperty(item as any, 'searchText', normalizeForSearch(trimmed));
  return { success: true };
}

export function deletePresentationSlide(
  organization: OrganizationType | null | undefined,
  presentationId: string,
  slideIndex: number,
): { success: boolean; updatedPresentation: PresentationResponse | null } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const items = getPresentationsFromOrg(organization);
  const item = items.find((i) => i.id === presentationId);
  if (!item) {
    throw new Error('Presentation not found');
  }

  if (!item.slides || !Array.isArray(item.slides)) {
    throw new Error('Presentation slides not loaded');
  }

  // Remove the slide at the given index
  removeCoListItem(
    item.slides,
    (_slide: PresentationSlideType | null, _idx?: number) => {
      if (!_slide) return false;
      return _slide.index === slideIndex;
    },
  );

  // Re-index remaining slides and update slideCount
  const remainingSlides = item.slides.filter(
    (s: PresentationSlideType | null): s is PresentationSlideType => s !== null,
  );
  remainingSlides.forEach((slide: PresentationSlideType, i: number) => {
    setCoMapProperty(slide as any, 'index', i);
  });
  setCoMapProperty(item as any, 'slideCount', remainingSlides.length);

  return {
    success: true,
    updatedPresentation: presentationToResponse(item),
  };
}

export function deletePresentation(
  organization: OrganizationType | null | undefined,
  id: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const items = getPresentationsFromOrg(organization);
  const item = items.find((i) => i.id === id);
  if (!item) {
    throw new Error('Presentation not found');
  }

  removeCoListItem(
    organization.presentations,
    (i: PresentationType | null) => i?.id === id,
  );

  return { success: true };
}
