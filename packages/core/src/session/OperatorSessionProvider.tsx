import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  OperatorSession,
  OperatorSessionType,
  OrganizationType,
} from '@worship-view/schema';
import { getOrganizationGroup, pushCoListItem, removeCoListItem, isCoListLoaded } from '@worship-view/schema';
import { OperatorSessionProvider as ContextProvider } from './OperatorSessionContext';

const HEARTBEAT_INTERVAL = 10_000; // 10s
const STALE_THRESHOLD = 60_000; // 60s

type DesktopProps = {
  mode: 'desktop';
  organization: OrganizationType;
  instanceName: string;
  children: ReactNode;
};

type RemoteProps = {
  mode: 'remote';
  organization: OrganizationType;
  sessionId: string;
  children: ReactNode;
};

type Props = DesktopProps | RemoteProps;

const DesktopSessionProvider: FC<DesktopProps> = ({
  organization,
  instanceName,
  children,
}) => {
  const [session, setSession] = useState<OperatorSessionType | null>(null);
  const sessionRef = useRef<OperatorSessionType | null>(null);
  const createdRef = useRef(false);

  // Create session on mount (once)
  useEffect(() => {
    if (createdRef.current) return;
    if (!organization?.sessions) return;

    createdRef.current = true;

    const orgGroup = getOrganizationGroup(organization);

    // Clean up stale sessions from this device
    if (isCoListLoaded(organization.sessions)) {
      const now = Date.now();
      const stale = (organization.sessions as (OperatorSessionType | null)[]).filter(
        (s) => s && (!s.isActive || now - s.lastHeartbeat > STALE_THRESHOLD),
      );
      for (const s of stale) {
        if (s) {
          removeCoListItem(
            organization.sessions,
            (item: OperatorSessionType | null) => item?.sessionId === s.sessionId,
          );
        }
      }
    }

    const newSession = OperatorSession.create(
      {
        sessionId: uuidv4(),
        instanceName,
        lastHeartbeat: Date.now(),
        isActive: true,
        projectionType: 'none',
        screensEnabled: true,
        selectedSongId: undefined,
        songPartIndex: undefined,
        songSlideIndex: undefined,
        verseBook: undefined,
        verseChapter: undefined,
        verseVerse: undefined,
        verseProjectionEnabled: false,
        selectedPresentationId: undefined,
        presentationSlideIndex: undefined,
        videoPlaying: true,
        videoVolume: 1,
        videoSeekRequest: undefined,
      },
      { owner: orgGroup },
    );

    pushCoListItem(organization.sessions, newSession);
    sessionRef.current = newSession as OperatorSessionType;
    setSession(newSession as OperatorSessionType);
  }, [organization, instanceName]);

  // Cleanup: mark inactive on unmount
  useEffect(() => {
    return () => {
      const s = sessionRef.current;
      if (s) {
        try {
          (s as any).$jazz.set('isActive', false);
        } catch {
          // Session may already be cleaned up
        }
      }
    };
  }, []);

  // Heartbeat
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      try {
        (session as any).$jazz.set('lastHeartbeat', Date.now());
      } catch {
        // ignore if session was cleaned up
      }
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [session]);

  // Set inactive on beforeunload
  useEffect(() => {
    const handleUnload = () => {
      const s = sessionRef.current;
      if (s) {
        try {
          (s as any).$jazz.set('isActive', false);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return <ContextProvider value={{ session, mode: 'desktop' }}>{children}</ContextProvider>;
};

const RemoteSessionProvider: FC<RemoteProps> = ({
  organization,
  sessionId,
  children,
}) => {
  const [session, setSession] = useState<OperatorSessionType | null>(null);

  useEffect(() => {
    if (!organization?.sessions || !isCoListLoaded(organization.sessions)) {
      setSession(null);
      return;
    }

    const found = (organization.sessions as (OperatorSessionType | null)[]).find(
      (s) => s?.sessionId === sessionId && s?.isActive,
    );
    setSession(found ?? null);
  }, [organization, sessionId]);

  return <ContextProvider value={{ session, mode: 'remote' }}>{children}</ContextProvider>;
};

const OperatorSessionProviderWrapper: FC<Props> = (props) => {
  if (props.mode === 'desktop') {
    return <DesktopSessionProvider {...props} />;
  }
  return <RemoteSessionProvider {...props} />;
};

export default OperatorSessionProviderWrapper;
