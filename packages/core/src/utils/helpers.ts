/**
 * Checks if we're in development mode.
 * Uses import.meta.env for Vite compatibility.
 */
export function inDev(): boolean {
  return (import.meta as any).env?.DEV === true;
}
