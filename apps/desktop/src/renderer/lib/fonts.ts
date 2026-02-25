import MontserratVariable from '@assets/fonts/montserrat/Montserrat-VariableFont_wght.ttf?url';
import IosevkaRegular from '@assets/fonts/iosevka/iosevka-fixed-regular.woff2?url';

// Convert relative/absolute URLs to full localhost URLs for frame windows
function getFontUrl(fontPath: string, targetDocument: Document): string {
  // Check if this is a frame window (about:blank)
  const isFrameWindow = targetDocument.defaultView?.location.href === 'about:blank' || 
                         targetDocument.defaultView?.location.protocol === 'about:';
  
  if (isFrameWindow) {
    // For frame windows, convert to absolute URL pointing to Vite dev server
    // If fontPath is already absolute (starts with http), use it as-is
    if (fontPath.startsWith('http://') || fontPath.startsWith('https://')) {
      return fontPath;
    }
    // If it's a relative path, make it absolute to localhost:3000 (Vite dev server)
    const baseUrl = 'http://localhost:3000';
    // Remove leading slash if present, Vite outputs paths like "/assets/..."
    const cleanPath = fontPath.startsWith('/') ? fontPath : `/${fontPath}`;
    return `${baseUrl}${cleanPath}`;
  }
  
  // For main window, use the path as-is (Vite handles this automatically)
  return fontPath;
}

export async function injectFontCSS(targetDocument: Document = document) {
  const montserratUrl = getFontUrl(MontserratVariable, targetDocument);
  const iosevkaUrl = getFontUrl(IosevkaRegular, targetDocument);
  
  const style = targetDocument.createElement('style');
  style.id = 'injected-fonts';
  
  style.textContent = `
    @font-face {
      font-family: 'Montserrat';
      font-weight: 100 900;
      font-style: normal;
      src: url('${montserratUrl}') format('truetype');
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Iosevka';
      font-weight: 400;
      font-style: normal;
      src: url('${iosevkaUrl}') format('woff2');
      font-display: swap;
    }
  `;
  
  // Remove existing injected fonts if present (for HMR)
  const existing = targetDocument.getElementById('injected-fonts');
  if (existing) {
    existing.remove();
  }
  
  targetDocument.head.appendChild(style);
}

