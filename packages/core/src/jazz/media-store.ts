import { v4 as uuidv4 } from 'uuid';
import { co, type FileStream, getLoadedOrUndefined } from 'jazz-tools';
import {
  MediaItem,
  MediaAsset,
  type MediaAssetType,
  MediaItemType,
  OrganizationType,
} from '@worship-view/schema';
import {
  getOrganizationGroup,
  setCoMapProperty,
  pushCoListItem,
  removeCoListItem,
  getMediaArray,
} from '@worship-view/schema';
import { extractVideoPosterBlob } from '../utils/video-poster';

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
  assetId: string;
  /** JPEG poster for video thumbnails */
  previewFileStreamId?: string;
};

function mediaItemToResponse(
  item: MediaItemType | null | undefined,
): MediaItemResponse | null {
  if (!item) return null;
  const previewId =
    typeof item.previewStreamId === 'string' ? item.previewStreamId : undefined;
  return {
    id: item.id,
    name: item.name,
    mediaType: item.mediaType as 'video' | 'image',
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    assetId: item.asset.$jazz.id,
    ...(previewId ? { previewFileStreamId: previewId } : {}),
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

async function ensureOrganizationMediaLoaded(
  organization: OrganizationType,
): Promise<OrganizationType> {
  return organization.$jazz.ensureLoaded({
    resolve: {
      media: { $each: true },
    },
  }) as Promise<OrganizationType>;
}

async function loadMediaItemFileStreamIdFromItem(
  item: MediaItemType | null | undefined,
): Promise<string | null> {
  if (!item) return null;

  const loadedItem = (await item.$jazz.ensureLoaded({
    resolve: { asset: { file: true } },
  })) as MediaItemType & { asset: MediaAssetType };
  const loadedFile = getLoadedOrUndefined(loadedItem.asset.file);
  return loadedFile?.$jazz?.id ?? null;
}

export async function loadMediaAssetFileStreamId(assetId: string): Promise<string | null> {
  const asset = (await MediaAsset.load(assetId, {
    resolve: { file: true },
  })) as MediaAssetType | null;
  if (!asset) return null;

  const loadedFile = getLoadedOrUndefined(asset.file);
  return loadedFile?.$jazz?.id ?? null;
}

export async function loadMediaItemFileStreamId(
  organization: OrganizationType | null | undefined,
  mediaItemId: string,
  fallbackAssetId?: string,
): Promise<string | null> {
  const item = getMediaFromOrg(organization).find((candidate) => candidate.id === mediaItemId);
  const fileStreamId = await loadMediaItemFileStreamIdFromItem(item);
  if (fileStreamId) {
    return fileStreamId;
  }
  if (fallbackAssetId) {
    return loadMediaAssetFileStreamId(fallbackAssetId);
  }
  return null;
}

export async function uploadMediaItem(
  organization: OrganizationType | null | undefined,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<MediaItemResponse> {
  if (!organization) {
    throw new Error('No active organization');
  }
  const loadedOrganization = await ensureOrganizationMediaLoaded(organization);

  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const orgGroup = getOrganizationGroup(loadedOrganization);
  const mediaType = ALLOWED_MIME_TYPES[file.type] as 'video' | 'image';

  let previewStream: FileStream | undefined;
  if (mediaType === 'video') {
    const posterBlob = await extractVideoPosterBlob(file);
    if (posterBlob) {
      previewStream = await co.fileStream().createFromBlob(posterBlob, {
        owner: orgGroup,
      });
    }
  }

  // Create FileStream from the file blob
  const fileStream = await co.fileStream().createFromBlob(file, {
    owner: orgGroup,
    onProgress,
  });
  const asset = MediaAsset.create(
    {
      file: fileStream,
    },
    { owner: orgGroup },
  );

  const id = uuidv4();

  // Create MediaItem CoMap
  const newItem = MediaItem.create(
    {
      version: 2,
      id,
      name: file.name,
      mediaType,
      mimeType: file.type,
      sizeBytes: file.size,
      asset,
      ...(previewStream ? { previewStreamId: previewStream.$jazz.id } : {}),
    },
    { owner: orgGroup },
  );

  // Ensure media list exists
  if (loadedOrganization.media) {
    pushCoListItem(loadedOrganization.media, newItem);
  }

  const response = mediaItemToResponse(newItem);
  if (!response) throw new Error('Failed to create media item response');
  return response;
}

export function renameMediaItem(
  organization: OrganizationType | null | undefined,
  id: string,
  newName: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const trimmed = newName.trim();
  if (!trimmed) {
    throw new Error('Media name cannot be empty');
  }

  const items = getMediaFromOrg(organization);
  const item = items.find((i) => i.id === id);
  if (!item) {
    throw new Error('Media item not found');
  }

  setCoMapProperty(item, 'name', trimmed);
  return { success: true };
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

/**
 * Attaches JPEG poster streams to video items that are missing previews.
 * Runs sequentially to limit decoder load.
 * Returns the set of item IDs where poster extraction permanently failed
 * (e.g. unsupported codec) so callers can avoid retrying them.
 */
export async function backfillVideoPreviews(
  organization: OrganizationType | null | undefined,
  options?: { signal?: AbortSignal },
): Promise<Set<string>> {
  const failed = new Set<string>();
  if (!organization) return failed;
  const orgGroup = getOrganizationGroup(organization);
  const items = getMediaFromOrg(organization);
  for (const item of items) {
    if (options?.signal?.aborted) return failed;
    if (!item || item.mediaType !== 'video') continue;
    if (item.previewStreamId) continue;
    const mainId = await loadMediaItemFileStreamIdFromItem(item);
    if (!mainId) continue;
    const blob = await co.fileStream().loadAsBlob(mainId);
    if (!blob) {
      failed.add(item.id);
      continue;
    }
    const posterBlob = await extractVideoPosterBlob(blob);
    if (!posterBlob) {
      failed.add(item.id);
      continue;
    }
    const previewStream = await co.fileStream().createFromBlob(posterBlob, {
      owner: orgGroup,
    });
    setCoMapProperty(item as MediaItemType, 'previewStreamId', previewStream.$jazz.id);
  }
  return failed;
}
