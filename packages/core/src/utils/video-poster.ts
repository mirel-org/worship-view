const MAX_PREVIEW_WIDTH = 320;
const JPEG_QUALITY = 0.82;

/**
 * Extracts a JPEG poster frame from a video blob (for thumbnails).
 * Returns null if decoding fails (unsupported codec, etc.).
 */
export async function extractVideoPosterBlob(videoBlob: Blob): Promise<Blob | null> {
  const objectUrl = URL.createObjectURL(videoBlob);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      const onLoaded = () => {
        video.removeEventListener('loadeddata', onLoaded);
        video.removeEventListener('error', onError);
        resolve();
      };
      const onError = () => {
        video.removeEventListener('loadeddata', onLoaded);
        video.removeEventListener('error', onError);
        reject(new Error('Video load failed'));
      };
      video.addEventListener('loadeddata', onLoaded);
      video.addEventListener('error', onError);
    });

    if (video.videoWidth < 1 || video.videoHeight < 1) return null;

    const seekTime =
      Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(0.1, video.duration * 0.001)
        : 0.001;
    video.currentTime = seekTime;

    await new Promise<void>((resolve, reject) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
        resolve();
      };
      const onError = () => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
        reject(new Error('Seek failed'));
      };
      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', onError);
    });

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const scale = Math.min(1, MAX_PREVIEW_WIDTH / vw);
    const cw = Math.max(1, Math.round(vw * scale));
    const ch = Math.max(1, Math.round(vh * scale));

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, cw, ch);

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY);
    });
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.removeAttribute('src');
    video.load();
  }
}
