export type RenderedPage = {
  index: number;
  data: ArrayBuffer;
  mimeType: string;
};

/**
 * Renders each page of a PDF to a PNG ArrayBuffer using the browser canvas.
 * Uses dynamic imports so this module is never pulled into the preload/main bundles.
 */
export async function renderPdfPages(
  pdfData: ArrayBuffer,
  scale = 2.0,
): Promise<RenderedPage[]> {
  // Dynamic import keeps pdfjs-dist out of the esbuild preload bundle
  const pdfjsLib = await import('pdfjs-dist');

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // Use new URL() pattern — Vite transforms this into a proper asset URL
    // at build time for the renderer, and esbuild ignores dynamic imports.
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href;
  }

  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfData),
    useSystemFonts: true,
  }).promise;

  const pages: RenderedPage[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Failed to get 2d context');

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to convert canvas to blob'));
      }, 'image/png');
    });

    const data = await blob.arrayBuffer();
    pages.push({ index: i - 1, data, mimeType: 'image/png' });
  }

  return pages;
}
