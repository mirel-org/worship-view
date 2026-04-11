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
    key: z.optional(z.string()),
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
 * TextStyle schema - represents a text style for audience slide projections
 * Uses sameAsContainer permissions so styles inherit organization's group
 */
export const TextStyle = co
  .map({
    id: z.string(),
    name: z.string(),
    fontFamily: z.string(),
    fontSize: z.number(),
    fontWeight: z.number(),
    italic: z.boolean(),
    uppercase: z.boolean(),
    fontColor: z.string(),
    shadowOffsetX: z.number(),
    shadowOffsetY: z.number(),
    shadowBlur: z.number(),
    shadowColor: z.string(),
    lineHeight: z.number(),
    textAlign: z.enum(['left', 'center', 'right']),
    songSlideSize: z.number(), // 1, 2, 4, 8, or 0 (0 = full verse)
    verticalAlign: z.optional(z.enum(['top', 'center', 'bottom'])),
    shadowEnabled: z.optional(z.boolean()),
  })
  .withPermissions({
    onInlineCreate: 'sameAsContainer',
  });

/**
 * PresentationSlide schema - represents a single slide (image or video) in a presentation
 * Uses sameAsContainer permissions so slides inherit organization's group
 */
export const PresentationSlide = co
  .map({
    index: z.number(),
    slideType: z.enum(['image', 'video']),
    mimeType: z.string(),
    file: co.fileStream(),
  })
  .withPermissions({
    onInlineCreate: 'sameAsContainer',
  });

/**
 * Presentation schema - represents a PowerPoint presentation converted to slides
 * Uses sameAsContainer permissions so presentations inherit organization's group
 */
export const Presentation = co
  .map({
    id: z.string(),
    name: z.string(),
    searchText: z.string(),
    slideCount: z.number(),
    slides: co.list(PresentationSlide).withPermissions({
      onInlineCreate: 'sameAsContainer',
    }),
    createdAt: z.number(),
  })
  .withPermissions({
    onInlineCreate: 'sameAsContainer',
  });

/**
 * OperatorSession schema - represents a desktop instance's projection state
 * Shared via Jazz so a remote webapp can read/write the same state
 */
export const OperatorSession = co
  .map({
    // Identity
    sessionId: z.string(),
    instanceName: z.string(),

    // Presence
    lastHeartbeat: z.number(),
    isActive: z.boolean(),

    // Projection state
    projectionType: z.enum(['none', 'song', 'verse', 'prayer', 'presentation']),
    screensEnabled: z.boolean(),

    // Song
    selectedSongId: z.optional(z.string()),
    songPartIndex: z.optional(z.number()),
    songSlideIndex: z.optional(z.number()),

    // Verse
    verseBook: z.optional(z.string()),
    verseChapter: z.optional(z.number()),
    verseVerse: z.optional(z.number()),
    verseProjectionEnabled: z.optional(z.boolean()),

    // Presentation
    selectedPresentationId: z.optional(z.string()),
    presentationSlideIndex: z.optional(z.number()),

    // Video control
    videoPlaying: z.optional(z.boolean()),
    videoVolume: z.optional(z.number()),
    videoSeekRequest: z.optional(z.number()),
  })
  .withPermissions({
    onInlineCreate: 'sameAsContainer',
  });

/**
 * Organization schema - contains songs, service lists, media, text styles, and presentations for a worship organization
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
    textStyles: co.list(TextStyle).withPermissions({
      onInlineCreate: 'sameAsContainer',
    }),
    presentations: co.list(Presentation).withPermissions({
      onInlineCreate: 'sameAsContainer',
    }),
    sessions: co.list(OperatorSession).withPermissions({
      onInlineCreate: 'sameAsContainer',
    }),
  })
  .withPermissions({
    onInlineCreate: 'newGroup',
  })
  .withMigration((org) => {
    if (!org.$jazz.has('songs')) {
      org.$jazz.set('songs', []);
    }
    if (!org.$jazz.has('serviceList')) {
      org.$jazz.set('serviceList', []);
    }
    if (!org.$jazz.has('media')) {
      org.$jazz.set('media', []);
    }
    if (!org.$jazz.has('textStyles')) {
      org.$jazz.set('textStyles', []);
    }
    if (!org.$jazz.has('presentations')) {
      org.$jazz.set('presentations', []);
    }
    if (!org.$jazz.has('sessions')) {
      org.$jazz.set('sessions', []);
    }
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
export type TextStyleType = co.loaded<typeof TextStyle>;
export type MediaItemType = co.loaded<typeof MediaItem>;
export type PresentationSlideType = co.loaded<typeof PresentationSlide>;
export type PresentationType = co.loaded<typeof Presentation>;
export type OperatorSessionType = co.loaded<typeof OperatorSession>;
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
