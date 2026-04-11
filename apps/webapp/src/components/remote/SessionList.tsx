import { FC, useMemo } from 'react';
import { Monitor, Wifi, WifiOff, X } from 'lucide-react';
import { useActiveOrganization } from '@worship-view/core';
import type { OperatorSessionType } from '@worship-view/schema';

const STALE_THRESHOLD = 30_000; // 30s

interface SessionListProps {
  onConnect: (sessionId: string) => void;
  onClose: () => void;
}

const SessionList: FC<SessionListProps> = ({ onConnect, onClose }) => {
  const { activeOrganization } = useActiveOrganization();

  const activeSessions = useMemo(() => {
    if (!activeOrganization?.sessions) return [];
    const now = Date.now();
    return (activeOrganization.sessions as unknown as (OperatorSessionType | null)[]).filter(
      (s): s is OperatorSessionType =>
        !!s && s.isActive && now - s.lastHeartbeat < STALE_THRESHOLD,
    );
  }, [activeOrganization?.sessions]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-background shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Conectare la proiector
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {!activeOrganization && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nu ești conectat la o organizație.
            </p>
          )}

          {activeOrganization && activeSessions.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground text-center">
              <WifiOff className="h-10 w-10 opacity-40" />
              <div>
                <p className="text-sm font-medium">Nu sunt sesiuni active</p>
                <p className="text-xs mt-1 opacity-70">
                  Deschide aplicația desktop pentru a porni un proiector.
                </p>
              </div>
            </div>
          )}

          {activeSessions.length > 0 && (
            <div className="flex flex-col gap-2">
              {activeSessions.map((session) => (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => onConnect(session.sessionId)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors text-left"
                >
                  <Monitor className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.instanceName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.projectionType === 'none'
                        ? 'Inactiv'
                        : `Tip: ${session.projectionType}`}
                      {session.screensEnabled && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Wifi className="h-3 w-3" />
                          Live
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-primary font-medium">
                    Conectează
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionList;
