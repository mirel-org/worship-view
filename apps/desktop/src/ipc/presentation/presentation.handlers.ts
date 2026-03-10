import { ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import {
  PresentationChannels,
  LibreOfficeCheckResult,
  PreparePresentationResult,
  ExtractedVideo,
} from './presentation.types';

const execFileAsync = promisify(execFile);

function getLibreOfficePaths(): string[] {
  switch (process.platform) {
    case 'darwin':
      return ['/Applications/LibreOffice.app/Contents/MacOS/soffice'];
    case 'win32':
      return [
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
      ];
    default:
      return ['/usr/bin/soffice', '/usr/local/bin/soffice'];
  }
}

async function findLibreOffice(): Promise<string | null> {
  for (const p of getLibreOfficePaths()) {
    try {
      await fs.access(p);
      return p;
    } catch {
      // not found at this path
    }
  }

  // Try which/where on PATH
  try {
    const cmd = process.platform === 'win32' ? 'where' : 'which';
    const { stdout } = await execFileAsync(cmd, ['soffice']);
    const found = stdout.trim().split('\n')[0];
    if (found) return found;
  } catch {
    // not on PATH
  }

  return null;
}

async function convertPptxToPdf(
  sofficePath: string,
  pptxPath: string,
  outDir: string,
): Promise<string> {
  await execFileAsync(sofficePath, [
    '--headless',
    '--convert-to',
    'pdf',
    '--outdir',
    outDir,
    pptxPath,
  ]);

  const baseName = path.basename(pptxPath, path.extname(pptxPath));
  return path.join(outDir, `${baseName}.pdf`);
}

async function extractVideos(
  pptxPath: string,
): Promise<ExtractedVideo[]> {
  const AdmZip = (await import('adm-zip')).default;
  const videos: ExtractedVideo[] = [];

  try {
    const zip = new AdmZip(pptxPath);
    const entries = zip.getEntries();

    // Find slide rels files to identify which slides have videos
    const slideRels = entries.filter((e) =>
      /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(e.entryName),
    );

    for (const rel of slideRels) {
      const slideMatch = rel.entryName.match(/slide(\d+)\.xml\.rels$/);
      if (!slideMatch) continue;

      const slideIndex = parseInt(slideMatch[1], 10) - 1; // 0-based
      const relContent = rel.getData().toString('utf-8');

      // Look for video references in relationships
      const videoMatches = relContent.matchAll(
        /Target="(\.\.\/media\/[^"]+\.(mp4|avi|mov|wmv|m4v))"/gi,
      );

      for (const match of videoMatches) {
        const targetPath = match[1].replace('..', 'ppt');
        const ext = match[2].toLowerCase();
        const videoEntry = entries.find(
          (e) => e.entryName.toLowerCase() === targetPath.toLowerCase(),
        );

        if (videoEntry) {
          const mimeMap: Record<string, string> = {
            mp4: 'video/mp4',
            avi: 'video/x-msvideo',
            mov: 'video/quicktime',
            wmv: 'video/x-ms-wmv',
            m4v: 'video/mp4',
          };

          const buf = videoEntry.getData();
          videos.push({
            slideIndex,
            mimeType: mimeMap[ext] || 'video/mp4',
            data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Failed to extract videos from PPTX:', err);
  }

  return videos;
}

const presentationHandlers = () => {
  ipcMain.handle(PresentationChannels.checkLibreOffice, async (): Promise<LibreOfficeCheckResult> => {
    const p = await findLibreOffice();
    return p ? { installed: true, path: p } : { installed: false };
  });

  ipcMain.handle(
    PresentationChannels.selectPptxFile,
    async (): Promise<string | null> => {
      const result = await dialog.showOpenDialog({
        filters: [{ name: 'PowerPoint', extensions: ['pptx'] }],
        properties: ['openFile'],
      });
      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths[0];
    },
  );

  ipcMain.handle(
    PresentationChannels.preparePresentation,
    async (_event, filePath: string): Promise<PreparePresentationResult> => {
      const sofficePath = await findLibreOffice();
      if (!sofficePath) {
        throw new Error('LibreOffice is not installed');
      }

      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wv-pptx-'));

      try {
        // Step 1: PPTX → PDF via LibreOffice
        const pdfPath = await convertPptxToPdf(sofficePath, filePath, tmpDir);

        // Step 2: Read PDF data to send to renderer for rendering
        const pdfBuffer = await fs.readFile(pdfPath);
        const pdfData = pdfBuffer.buffer.slice(
          pdfBuffer.byteOffset,
          pdfBuffer.byteOffset + pdfBuffer.byteLength,
        ) as ArrayBuffer;

        // Step 3: Extract videos from PPTX
        const videos = await extractVideos(filePath);

        const name = path.basename(filePath, path.extname(filePath));

        return { name, pdfData, videos };
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
      }
    },
  );
};

export default presentationHandlers;
