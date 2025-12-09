declare module '*.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module "*.woff2";
declare module "*.ttf";
declare module 'textfit';

declare namespace NodeJS {
  interface ProcessEnv {
    WORKERS_API_URL?: string;
  }
}