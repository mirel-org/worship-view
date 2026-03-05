export type SpeechResultCallback = (text: string, isFinal: boolean) => void;
export type SpeechStateCallback = (state: 'started' | 'stopped' | 'error') => void;

export interface SpeechEngine {
  start(): void;
  stop(): void;
  onResult: SpeechResultCallback | null;
  onStateChange: SpeechStateCallback | null;
}

const MAX_CONSECUTIVE_ERRORS = 5;
const BASE_RESTART_DELAY_MS = 300;
const MAX_RESTART_DELAY_MS = 30_000;

export class SonioxSpeechEngine implements SpeechEngine {
  private apiKey: string;
  private deviceId: string;
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private running = false;
  private shouldRestart = false;
  private restartTimeout: ReturnType<typeof setTimeout> | null = null;
  private consecutiveErrors = 0;
  private hadSuccessfulResult = false;
  private nativeSampleRate = 16000;
  private segmentAccumulatedText = '';

  onResult: SpeechResultCallback | null = null;
  onStateChange: SpeechStateCallback | null = null;

  constructor(apiKey: string, deviceId: string) {
    this.apiKey = apiKey;
    this.deviceId = deviceId;
  }

  start(): void {
    if (this.running) return;

    if (!this.apiKey) {
      this.onStateChange?.('error');
      return;
    }

    this.shouldRestart = true;
    this.consecutiveErrors = 0;
    this.hadSuccessfulResult = false;
    this.startPipeline();
  }

  stop(): void {
    this.shouldRestart = false;
    this.running = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    this.teardownPipeline();
    this.onStateChange?.('stopped');
  }

  private teardownPipeline(): void {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws.close();
      this.ws = null;
    }
  }

  private async startPipeline(): Promise<void> {
    try {
      // 1. Get microphone stream
      const constraints: MediaStreamConstraints = {
        audio: this.deviceId === 'default'
          ? true
          : { deviceId: { exact: this.deviceId } },
      };
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // 2. Set up AudioContext at 16kHz (Soniox expects 16kHz PCM)
      let audioContext: AudioContext;
      try {
        audioContext = new AudioContext({ sampleRate: 16000 });
        this.nativeSampleRate = 16000;
      } catch {
        // Fallback: use default sample rate and downsample
        audioContext = new AudioContext();
        this.nativeSampleRate = audioContext.sampleRate;
      }
      this.audioContext = audioContext;

      const source = audioContext.createMediaStreamSource(this.mediaStream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      this.scriptProcessor = processor;

      // 3. Connect WebSocket to Soniox
      const ws = new WebSocket('wss://stt-rt.soniox.com/transcribe-websocket');
      this.ws = ws;

      ws.onopen = () => {
        // Send configuration
        ws.send(
          JSON.stringify({
            api_key: this.apiKey,
            model: 'stt-rt-v4',
            audio_format: 's16le',
            sample_rate: 16000,
            num_channels: 1,
            language_hints: ['ro'],
          }),
        );

        // Start streaming audio
        source.connect(processor);
        processor.connect(audioContext.destination);

        this.running = true;
        this.segmentAccumulatedText = '';
        this.onStateChange?.('started');
      };

      // Downsample ratio (1 if already 16kHz)
      const downsampleRatio = Math.round(this.nativeSampleRate / 16000);

      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputData = event.inputBuffer.getChannelData(0);

        let pcmData: Float32Array;
        if (downsampleRatio > 1) {
          // Downsample by picking every Nth sample
          const outputLength = Math.floor(inputData.length / downsampleRatio);
          pcmData = new Float32Array(outputLength);
          for (let i = 0; i < outputLength; i++) {
            pcmData[i] = inputData[i * downsampleRatio];
          }
        } else {
          pcmData = inputData;
        }

        // Convert Float32 [-1, 1] → Int16 PCM
        const int16 = new Int16Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          const s = Math.max(-1, Math.min(1, pcmData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        this.ws.send(int16.buffer);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string);
          if (data.tokens && Array.isArray(data.tokens)) {
            this.consecutiveErrors = 0;
            this.hadSuccessfulResult = true;

            // Concatenate all token texts from this message
            const messageText = data.tokens
              .map((t: { text: string }) => t.text)
              .join('');
            const isFinal = data.tokens.every(
              (t: { is_final: boolean }) => t.is_final,
            );

            if (messageText) {
              // Accumulate segment text to handle mid-segment token drops.
              // Soniox finalizes tokens left-to-right and drops them from
              // subsequent messages, shifting the array. Find the overlap
              // between our accumulated text and the new message, then
              // append only the genuinely new content.
              const accum = this.segmentAccumulatedText;
              const maxOverlap = Math.min(accum.length, messageText.length);
              let overlapLen = 0;
              for (let len = 1; len <= maxOverlap; len++) {
                if (accum.endsWith(messageText.substring(0, len))) {
                  overlapLen = len;
                }
              }
              this.segmentAccumulatedText += messageText.substring(overlapLen);

              console.log(
                `[soniox] ${isFinal ? 'FINAL' : 'interim'}`,
                JSON.stringify(
                  data.tokens.map(
                    (t: { text: string; is_final: boolean }) =>
                      `${t.text}${t.is_final ? '✓' : '…'}`,
                  ),
                ),
                `| accum="${this.segmentAccumulatedText}"`,
              );
              this.onResult?.(this.segmentAccumulatedText, isFinal);

              // Reset accumulator at end of segment (all tokens finalized)
              if (isFinal) {
                this.segmentAccumulatedText = '';
              }
            }
          }
        } catch {
          // Malformed message — ignore
        }
      };

      ws.onerror = () => {
        this.consecutiveErrors++;
        this.onStateChange?.('error');
      };

      ws.onclose = () => {
        this.running = false;
        this.teardownPipeline();

        if (!this.shouldRestart) {
          this.onStateChange?.('stopped');
          return;
        }

        if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS && !this.hadSuccessfulResult) {
          this.shouldRestart = false;
          this.onStateChange?.('error');
          return;
        }

        const delay = this.consecutiveErrors > 0
          ? Math.min(
              BASE_RESTART_DELAY_MS * Math.pow(2, this.consecutiveErrors),
              MAX_RESTART_DELAY_MS,
            )
          : BASE_RESTART_DELAY_MS;

        this.restartTimeout = setTimeout(() => {
          if (this.shouldRestart) {
            this.startPipeline();
          }
        }, delay);
      };
    } catch {
      this.consecutiveErrors++;
      this.running = false;
      this.teardownPipeline();

      if (!this.shouldRestart) {
        this.onStateChange?.('stopped');
        return;
      }

      if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        this.shouldRestart = false;
        this.onStateChange?.('error');
        return;
      }

      const delay = Math.min(
        BASE_RESTART_DELAY_MS * Math.pow(2, this.consecutiveErrors),
        MAX_RESTART_DELAY_MS,
      );

      this.restartTimeout = setTimeout(() => {
        if (this.shouldRestart) {
          this.startPipeline();
        }
      }, delay);
    }
  }
}
