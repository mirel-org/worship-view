// Electron v28+ provides Fetch API globals in the main process.
// @types/node@16 doesn't declare them, so we add minimal declarations here.
interface Request {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Response {}
