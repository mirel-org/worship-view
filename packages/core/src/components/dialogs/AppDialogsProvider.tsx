import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@worship-view/ui';

type DialogVariant = 'default' | 'destructive';

type AlertDialogOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  variant?: DialogVariant;
};

type ConfirmDialogOptions = AlertDialogOptions & {
  cancelLabel?: string;
};

type AppDialogsApi = {
  alert: (options: string | AlertDialogOptions) => Promise<void>;
  confirm: (options: string | ConfirmDialogOptions) => Promise<boolean>;
};

type DialogRequest =
  | {
      kind: 'alert';
      options: Required<AlertDialogOptions>;
      resolve: () => void;
    }
  | {
      kind: 'confirm';
      options: Required<ConfirmDialogOptions>;
      resolve: (value: boolean) => void;
    };

const AppDialogsContext = createContext<AppDialogsApi | null>(null);

function normalizeAlertOptions(
  options: string | AlertDialogOptions,
): Required<AlertDialogOptions> {
  if (typeof options === 'string') {
    return {
      title: 'Mesaj',
      description: options,
      confirmLabel: 'OK',
      variant: 'default',
    };
  }

  return {
    title: options.title ?? 'Mesaj',
    description: options.description,
    confirmLabel: options.confirmLabel ?? 'OK',
    variant: options.variant ?? 'default',
  };
}

function normalizeConfirmOptions(
  options: string | ConfirmDialogOptions,
): Required<ConfirmDialogOptions> {
  if (typeof options === 'string') {
    return {
      title: 'Confirmare',
      description: options,
      confirmLabel: 'Continuă',
      cancelLabel: 'Anulează',
      variant: 'default',
    };
  }

  return {
    title: options.title ?? 'Confirmare',
    description: options.description,
    confirmLabel: options.confirmLabel ?? 'Continuă',
    cancelLabel: options.cancelLabel ?? 'Anulează',
    variant: options.variant ?? 'default',
  };
}

export function AppDialogsProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<DialogRequest[]>([]);
  const queueRef = useRef<DialogRequest[]>([]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const closeCurrent = useCallback((result?: boolean) => {
    setQueue((currentQueue) => {
      const [current, ...rest] = currentQueue;
      if (!current) return currentQueue;

      if (current.kind === 'confirm') {
        current.resolve(result ?? false);
      } else {
        current.resolve();
      }

      return rest;
    });
  }, []);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((request) => {
        if (request.kind === 'confirm') {
          request.resolve(false);
        } else {
          request.resolve();
        }
      });
    };
  }, []);

  const api = useMemo<AppDialogsApi>(
    () => ({
      alert: (options) =>
        new Promise<void>((resolve) => {
          setQueue((currentQueue) => [
            ...currentQueue,
            {
              kind: 'alert',
              options: normalizeAlertOptions(options),
              resolve,
            },
          ]);
        }),
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          setQueue((currentQueue) => [
            ...currentQueue,
            {
              kind: 'confirm',
              options: normalizeConfirmOptions(options),
              resolve,
            },
          ]);
        }),
    }),
    [],
  );

  const currentDialog = queue[0] ?? null;

  return (
    <AppDialogsContext.Provider value={api}>
      {children}
      <Dialog
        open={!!currentDialog}
        onOpenChange={(open) => {
          if (!open) {
            closeCurrent(false);
          }
        }}
      >
        {currentDialog && (
          <DialogContent className="sm:max-w-md [&>button]:hidden">
            <DialogHeader>
              <DialogTitle>{currentDialog.options.title}</DialogTitle>
              <DialogDescription className="whitespace-pre-line">
                {currentDialog.options.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {currentDialog.kind === 'confirm' && (
                <Button variant="outline" onClick={() => closeCurrent(false)}>
                  {currentDialog.options.cancelLabel}
                </Button>
              )}
              <Button
                variant={currentDialog.options.variant}
                onClick={() =>
                  closeCurrent(currentDialog.kind === 'confirm' ? true : undefined)
                }
              >
                {currentDialog.options.confirmLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AppDialogsContext.Provider>
  );
}

export function useAppDialogs() {
  const value = useContext(AppDialogsContext);

  if (!value) {
    throw new Error('useAppDialogs must be used within AppDialogsProvider');
  }

  return value;
}
