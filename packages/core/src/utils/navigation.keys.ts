// Keys that move to the previous / next slide, verse or presentation page.
// PageUp / PageDown are what presenter remotes send (e.g. Logitech R400).
export const PREVIOUS_SLIDE_KEYS = ['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft', 'PageUp'];
export const NEXT_SLIDE_KEYS = [' ', 's', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight', 'PageDown'];

// Presenter remote "blank screen" button (R400 sends "." or "b" depending on the model)
export const BLANK_SCREEN_KEYS = ['.', 'b', 'B'];

// Presenter remote "start slideshow" button (R400 alternates F5 / Esc; Shift+F5 is also F5)
export const SHOW_PROJECTION_KEYS = ['Enter', 'F5'];
