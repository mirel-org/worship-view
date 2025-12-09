declare module '*.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module "*.woff2";
declare module "*.woff2?url" {
  const src: string;
  export default src;
}
declare module "*.ttf";
declare module "*.ttf?url" {
  const src: string;
  export default src;
}
declare module 'textfit';

// Vite-specific declarations
declare const APP_WINDOW_VITE_DEV_SERVER_URL: string;
declare const APP_WINDOW_VITE_NAME: string;

// Vite HMR types
interface ImportMeta {
  readonly hot?: {
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: string[], cb: (mods: any[]) => void): void;
    dispose(cb: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
    off(event: string, cb: (...args: any[]) => void): void;
    send(event: string, data?: any): void;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
  }
}