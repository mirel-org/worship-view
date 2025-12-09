import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { gdriveSyncService, type SyncState } from '../../lib/automerge/gdrive-sync';
import { Input } from '../ui/input';

export function SettingsGoogleDrive() {
  const [syncState, setSyncState] = useState<SyncState>(gdriveSyncService.getState());
  const [authCode, setAuthCode] = useState('');
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = gdriveSyncService.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const { authUrl: url } = await gdriveSyncService.authenticate();
      setAuthUrl(url);
    } catch (error: any) {
      alert(`Failed to start authentication: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCompleteAuth = async () => {
    if (!authCode.trim()) {
      alert('Please enter the authorization code');
      return;
    }

    try {
      setIsConnecting(true);
      await gdriveSyncService.completeAuthentication(authCode.trim());
      setAuthCode('');
      setAuthUrl(null);
      alert('Successfully connected to Google Drive!');
    } catch (error: any) {
      alert(`Failed to complete authentication: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from Google Drive?')) {
      return;
    }

    try {
      await gdriveSyncService.disconnect();
      alert('Disconnected from Google Drive');
    } catch (error: any) {
      alert(`Failed to disconnect: ${error.message}`);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold my-4">Google Drive Sync</h2>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                syncState.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span>
              {syncState.isAuthenticated ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* Last Sync Time */}
        {syncState.lastSyncTime && (
          <div className="space-y-2">
            <Label>Last Sync</Label>
            <p className="text-sm text-muted-foreground">
              {syncState.lastSyncTime.toLocaleString()}
            </p>
          </div>
        )}

        {/* Sync Status */}
        {syncState.status !== 'idle' && (
          <div className="space-y-2">
            <Label>Sync Status</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm capitalize">{syncState.status}</span>
              {syncState.status === 'syncing' && (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {syncState.error && (
          <div className="space-y-2">
            <Label className="text-destructive">Error</Label>
            <p className="text-sm text-destructive">{syncState.error}</p>
          </div>
        )}

        {/* Authentication Flow */}
        {!syncState.isAuthenticated ? (
          <div className="space-y-4">
            {!authUrl ? (
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect to Google Drive'}
              </Button>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Authorization URL</Label>
                  <p className="text-sm text-muted-foreground">
                    Open this URL in your browser and authorize the application:
                  </p>
                  <div className="flex gap-2">
                    <Input value={authUrl} readOnly className="flex-1" />
                    <Button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open(authUrl, '_blank');
                        }
                      }}
                    >
                      Open
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-code">Authorization Code</Label>
                  <p className="text-sm text-muted-foreground">
                    Paste the authorization code you received:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="auth-code"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="Enter authorization code"
                      className="flex-1"
                    />
                    <Button onClick={handleCompleteAuth} disabled={isConnecting}>
                      {isConnecting ? 'Connecting...' : 'Complete'}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAuthUrl(null);
                    setAuthCode('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

