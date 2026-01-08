import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useUpdate } from '../../../ipc/update/update.hooks';

export const UpdateDialog: React.FC = () => {
  const {
    updateInfo,
    error,
    isAvailable,
    isDownloaded,
    quitAndInstall,
  } = useUpdate();

  const [dismissed, setDismissed] = useState(false);
  
  // Reset dismissed state when a new update becomes available
  useEffect(() => {
    if (isAvailable || isDownloaded) {
      setDismissed(false);
    }
  }, [isAvailable, isDownloaded]);
  
  const shouldShow = (isAvailable || isDownloaded || (error !== null)) && !dismissed;

  const formatReleaseNotes = (notes?: string | string[] | null): string => {
    if (!notes) return 'No release notes available.';
    if (typeof notes === 'string') return notes;
    if (Array.isArray(notes)) {
      return notes.join('\n\n');
    }
    return 'Release notes available.';
  };

  return (
    <Dialog open={shouldShow} onOpenChange={(open) => !open && setDismissed(true)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isDownloaded
              ? 'Update Ready to Install'
              : isAvailable
              ? 'Update Available'
              : error
              ? 'Update Error'
              : 'Checking for Updates'}
          </DialogTitle>
          <DialogDescription>
            {isDownloaded
              ? `Version ${updateInfo?.version} has been downloaded and is ready to install.`
              : isAvailable
              ? `A new version (${updateInfo?.version}) is available. Downloading automatically...`
              : error
              ? `An error occurred while checking for updates: ${error.message}`
              : 'Checking for updates...'}
          </DialogDescription>
        </DialogHeader>

        {isAvailable && updateInfo && (
          <div className="space-y-4 py-4">
            {updateInfo.releaseNotes && (
              <div className="rounded-md bg-muted p-4 text-sm">
                <div className="font-semibold mb-2">Release Notes:</div>
                <div className="whitespace-pre-wrap">
                  {formatReleaseNotes(updateInfo.releaseNotes)}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        )}

        <DialogFooter>
          {isDownloaded ? (
            <>
              <Button variant="outline" onClick={() => setDismissed(true)}>
                Later
              </Button>
              <Button onClick={quitAndInstall}>Install & Restart</Button>
            </>
          ) : isAvailable ? (
            // Download happens automatically, just show a dismiss option
            <Button variant="outline" onClick={() => setDismissed(true)}>
              Close
            </Button>
          ) : error ? (
            <Button variant="outline" onClick={() => setDismissed(true)}>
              Close
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

