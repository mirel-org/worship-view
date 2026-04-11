import { createContext, useContext } from 'react';
import type { OperatorSessionType } from '@worship-view/schema';

export type SessionMode = 'desktop' | 'remote';

interface SessionContextValue {
  session: OperatorSessionType | null;
  mode: SessionMode | null;
}

const OperatorSessionContext = createContext<SessionContextValue>({
  session: null,
  mode: null,
});

export const OperatorSessionProvider = OperatorSessionContext.Provider;

export function useSession(): OperatorSessionType | null {
  return useContext(OperatorSessionContext).session;
}

export function useSessionMode(): SessionMode | null {
  return useContext(OperatorSessionContext).mode;
}

export function useRequiredSession(): OperatorSessionType {
  const { session } = useContext(OperatorSessionContext);
  if (!session) throw new Error('useRequiredSession must be used within an OperatorSessionProvider with a valid session');
  return session;
}
