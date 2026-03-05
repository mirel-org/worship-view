import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import {
  autoModeEnabledAtom,
  autoModeLastTranscriptionAtom,
  autoModeStateAtom,
  autoModeProgressAtom,
  sonioxApiKeyAtom,
  autoModeDeviceIdAtom,
} from '../../state/automode.atoms';
import { Input, Label } from '@worship-view/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@worship-view/ui';

const STATE_LABELS: Record<string, string> = {
  disabled: 'Dezactivat',
  listening: 'Ascultă...',
  tracking: 'Urmărește',
  error: 'Eroare — recunoașterea vocală nu funcționează',
};

export function SettingsAutoMode() {
  const [enabled, setEnabled] = useAtom(autoModeEnabledAtom);
  const [lastTranscription] = useAtom(autoModeLastTranscriptionAtom);
  const [autoModeState] = useAtom(autoModeStateAtom);
  const [progress] = useAtom(autoModeProgressAtom);
  const [apiKey, setApiKey] = useAtom(sonioxApiKeyAtom);
  const [selectedDeviceId, setSelectedDeviceId] = useAtom(autoModeDeviceIdAtom);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Load audio input devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permission first (needed to get device labels)
        await navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          stream.getTracks().forEach((t) => t.stop());
        });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(allDevices.filter((d) => d.kind === 'audioinput'));
      } catch {
        // Permission denied or no devices — leave list empty
      }
    };
    loadDevices();
  }, []);

  const handleToggle = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mod Auto</h3>
      <p className="text-sm text-muted-foreground">
        Mod Auto avansează automat slide-urile cântecului ascultând microfonul
        și detectând ce se cântă.
      </p>

      {/* Soniox API Key */}
      <div className="space-y-2">
        <Label htmlFor="soniox-api-key">Cheie API Soniox</Label>
        <Input
          id="soniox-api-key"
          type="password"
          placeholder="Introduceți cheia API Soniox"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Obțineți o cheie API de la soniox.com pentru recunoașterea vocală.
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="text-sm font-medium">Activează Mod Auto</Label>
          <p className="text-xs text-muted-foreground">
            Slide-urile avansează automat în timp ce se cântă
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Status */}
      {enabled && (
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                autoModeState === 'tracking'
                  ? 'bg-green-500'
                  : autoModeState === 'listening'
                    ? 'bg-yellow-500 animate-pulse'
                    : autoModeState === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
              }`}
            />
            <span className="text-sm">{STATE_LABELS[autoModeState] ?? autoModeState}</span>
            {autoModeState === 'tracking' && (
              <span className="text-xs text-muted-foreground ml-auto">
                Progres: {Math.round(progress * 100)}%
              </span>
            )}
          </div>
          {autoModeState === 'error' && (
            <p className="text-xs text-red-500">
              Recunoașterea vocală nu a putut porni. Verificați cheia API Soniox,
              conexiunea la internet și permisiunea pentru microfon.
              Dezactivați și reactivați Mod Auto pentru a încerca din nou.
            </p>
          )}
        </div>
      )}

      {/* Microphone Picker */}
      {devices.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="automode-mic">Microfon</Label>
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
            <SelectTrigger id="automode-mic" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microfon ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Live Transcription Preview */}
      {enabled && (
        <div className="space-y-2">
          <Label>Transcriere live</Label>
          <div className="min-h-[60px] rounded-lg border bg-muted/30 p-3 text-sm font-mono">
            {lastTranscription || (
              <span className="text-muted-foreground italic">
                Se așteaptă recunoașterea vocală...
              </span>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Apăsați F8 pentru a comuta Mod Auto rapid.
      </p>
    </div>
  );
}
