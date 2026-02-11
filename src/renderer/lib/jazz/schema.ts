import { co, z } from 'jazz-tools';

/**
 * Song schema - represents a worship song with lyrics
 * Uses sameAsContainer permissions so songs inherit organization's group
 * Stores parsed song data for fast loading (no parsing needed on app startup)
 */
export const Song = co
  .map({
    id: z.string(),
    name: z.string(),
    parts: z.array(
      z.object({
        key: z.string(),
        slides: z.array(
          z.object({
            lines: z.array(z.string()),
          }),
        ),
      }),
    ),
    arrangement: z.array(z.string()),
    searchText: z.string(), // Normalized searchable text (lowercase, diacritics removed)
  })
  .withPermissions({
    onInlineCreate: 'sameAsContainer',
  });

/**
 * ServiceListItem schema - represents a song in the service list with position
 * Uses sameAsContainer permissions so items inherit organization's group
 */
export const ServiceListItem = co
  .map({
    songId: z.string(),
    position: z.number(),
  })
  .withPermissions({
    onInlineCreate: 'sameAsContainer',
  });

/**
 * MediaItem schema - represents a media file (image or video) stored via Jazz FileStream
 * Uses sameAsContainer permissions so media items inherit organization's group
 */
export const MediaItem = co
  .map({
    id: z.string(),
    name: z.string(),
    mediaType: z.enum(['video', 'image']),
    mimeType: z.string(),
    sizeBytes: z.number(),
    file: co.fileStream(),
  })
  .withPermissions({
    onInlineCreate: 'sameAsContainer',
  });

/**
 * Organization schema - contains songs, service lists, and media for a worship organization
 * Uses newGroup permissions so each organization gets its own group for access control
 */
export const Organization = co
  .map({
    name: z.string(),
    songs: co.list(Song).withPermissions({
      onInlineCreate: 'sameAsContainer',
    }),
    serviceList: co.list(ServiceListItem).withPermissions({
      onInlineCreate: 'sameAsContainer',
    }),
    media: co.list(MediaItem).withPermissions({
      onInlineCreate: 'sameAsContainer',
    }),
  })
  .withPermissions({
    onInlineCreate: 'newGroup',
  });

/**
 * Account root schema - contains user's organizations
 */
export const WorshipViewRoot = co.map({
  organizations: co.list(Organization),
});

/**
 * Account schema with migration
 * Handles initialization of root and profile on account creation
 * Follows the official Jazz organization pattern
 */
export const WorshipViewAccount = co
  .account({
    root: WorshipViewRoot,
    profile: co
      .profile({
        name: z.string(),
      })
      .withPermissions({
        onCreate: (group) => group.makePublic(),
      }),
  })
  .withMigration(async (account, creationProps?: { name?: string }) => {
    // Initialize profile first if needed
    if (!account.$jazz.has('profile')) {
      account.$jazz.set('profile', {
        name: creationProps?.name ?? 'User',
      });
    }

    // Initialize root if needed
    if (!account.$jazz.has('root')) {
      account.$jazz.set('root', {
        organizations: [],
      });
    }
  });

// Export types for use throughout the application
export type SongType = co.loaded<typeof Song>;
export type ServiceListItemType = co.loaded<typeof ServiceListItem>;
export type MediaItemType = co.loaded<typeof MediaItem>;
export type OrganizationType = co.loaded<typeof Organization>;
export type WorshipViewAccountType = co.loaded<typeof WorshipViewAccount>;

/**
 * Resolved account type with organizations loaded
 * Use this for type-safe access to organizations
 */
export const WorshipViewAccountWithOrganizations = WorshipViewAccount.resolved({
  root: {
    organizations: { $each: { $onError: 'catch' } },
  },
});

export type WorshipViewAccountWithOrganizationsType = co.loaded<
  typeof WorshipViewAccountWithOrganizations
>;
