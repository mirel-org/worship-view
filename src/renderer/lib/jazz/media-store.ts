import { v4 as uuidv4 } from 'uuid';
import { co } from 'jazz-tools';
import {
  MediaItem,
  MediaItemType,
  OrganizationType,
} from './schema';
import {
  getOrganizationGroup,
  setCoMapProperty,
  pushCoListItem,
  removeCoListItem,
  getMediaArray,
} from './helpers';

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

const ALLOWED_MIME_TYPES: Record<string, 'video' | 'image'> = {
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'image/png': 'image',
  'image/jpeg': 'image',
};

export type MediaItemResponse = {
  id: string;
  name: string;
  mediaType: 'video' | 'image';
  mimeType: string;
  sizeBytes: number;
  fileStreamId: string;
};

function mediaItemToResponse(
  item: MediaItemType | null | undefined,
): MediaItemResponse | null {
  if (!item) return null;
  const fileId = (item.file as any)?.$jazz?.id ?? (item.file as any)?.id;
  if (!fileId) return null;
  return {
    id: item.id,
    name: item.name,
    mediaType: item.mediaType as 'video' | 'image',
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    fileStreamId: fileId,
  };
}

function getMediaFromOrg(
  organization: OrganizationType | null | undefined,
): MediaItemType[] {
  const items = getMediaArray(organization);
  return items.filter(
    (item: MediaItemType | null): item is MediaItemType => item !== null,
  );
}

export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 500MB.` };
  }
  if (!ALLOWED_MIME_TYPES[file.type]) {
    return { valid: false, error: `Unsupported file type: ${file.type}. Supported: mp4, mov, png, jpg, jpeg.` };
  }
  return { valid: true };
}

export function getMediaItems(
  organization: OrganizationType | null | undefined,
): MediaItemResponse[] {
  const items = getMediaFromOrg(organization);
  return items
    .map((item) => mediaItemToResponse(item))
    .filter((r): r is MediaItemResponse => r !== null);
}

export async function uploadMediaItem(
  organization: OrganizationType | null | undefined,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<MediaItemResponse> {
  if (!organization) {
    throw new Error('No active organization');
  }

  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const orgGroup = getOrganizationGroup(organization);
  const mediaType = ALLOWED_MIME_TYPES[file.type]!;

  // Create FileStream from the file blob
  const fileStream = await co.fileStream().createFromBlob(file, {
    owner: orgGroup,
    onProgress,
  });

  const id = uuidv4();

  // Create MediaItem CoMap
  const newItem = MediaItem.create(
    {
      id,
      name: file.name,
      mediaType,
      mimeType: file.type,
      sizeBytes: file.size,
      file: fileStream,
    },
    { owner: orgGroup },
  );

  // Ensure media list exists
  if (!organization.media) {
    setCoMapProperty(organization, 'media', []);
  }
  pushCoListItem(organization.media, newItem);

  const response = mediaItemToResponse(newItem);
  if (!response) throw new Error('Failed to create media item response');
  return response;
}

export function deleteMediaItem(
  organization: OrganizationType | null | undefined,
  id: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const items = getMediaFromOrg(organization);
  const item = items.find((i) => i.id === id);
  if (!item) {
    throw new Error('Media item not found');
  }

  removeCoListItem(
    organization.media,
    (i: MediaItemType | null) => i?.id === id,
  );

  return { success: true };
}
