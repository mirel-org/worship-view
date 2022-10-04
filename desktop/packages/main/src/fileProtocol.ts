import { app, ProtocolRequest, ProtocolResponse } from 'electron';

export function fileHandler(
  req: ProtocolRequest,
  callback: (response: string | ProtocolResponse) => void,
) {
  const root = app.getPath("documents") + "/worship-view/";
  const requestedPath = root + req.url.replace("local-files://", "");
  // Write some code to resolve path, calculate absolute path etc
  const check = true;

  if (!check) {
    callback({
      // -6 is FILE_NOT_FOUND
      // https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h
      error: -6,
    });
    return;
  }

  callback({
    path: requestedPath,
  });
}
