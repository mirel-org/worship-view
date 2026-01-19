import { app, net } from 'electron';
import { pathToFileURL } from 'url';
import path from 'path';

export function getFilePath(url: string): string {
  const root = app.getPath('documents') + '/worship-view/';
  const relativePath = url.replace('local-files://', '');
  return path.join(root, relativePath);
}

export function fileHandler(request: Request): Promise<Response> {
  const filePath = getFilePath(request.url);
  console.log('requestedPath', filePath);
  return net.fetch(pathToFileURL(filePath).toString());
}
