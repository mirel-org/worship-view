let _videoEnabled = false;

export function setVideoEnabled(enabled: boolean): void {
  _videoEnabled = enabled;
}

export function isVideoEnabled(): boolean {
  return _videoEnabled;
}
