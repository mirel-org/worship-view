import MontserratVariable from '@assets/fonts/montserrat/Montserrat-VariableFont_wght.ttf?url';

export function injectFontCSS() {
  const style = document.createElement('style');
  style.id = 'injected-fonts';

  style.textContent = `
    @font-face {
      font-family: 'Montserrat';
      font-weight: 100 900;
      font-style: normal;
      src: url('${MontserratVariable}') format('truetype');
      font-display: swap;
    }
  `;

  const existing = document.getElementById('injected-fonts');
  if (existing) {
    existing.remove();
  }

  document.head.appendChild(style);
}
