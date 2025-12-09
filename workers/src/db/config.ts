export function getDatabaseUrl(env?: { DATABASE_URL?: string; HYPERDRIVE?: Hyperdrive }): string {
  console.log('[getDatabaseUrl] Checking for connection string...');
  console.log('[getDatabaseUrl] Has HYPERDRIVE:', !!env?.HYPERDRIVE);
  console.log('[getDatabaseUrl] Has HYPERDRIVE.connectionString:', !!env?.HYPERDRIVE?.connectionString);
  console.log('[getDatabaseUrl] Has DATABASE_URL in env:', !!env?.DATABASE_URL);
  console.log('[getDatabaseUrl] Has DATABASE_URL in process.env:', !!process.env.DATABASE_URL);
  
  // Use Hyperdrive connection string if available (recommended for Cloudflare Workers)
  if (env?.HYPERDRIVE?.connectionString) {
    const connStr = env.HYPERDRIVE.connectionString;
    console.log('[getDatabaseUrl] Using HYPERDRIVE connection string');
    console.log('[getDatabaseUrl] Connection string preview:', connStr.substring(0, 50) + '...');
    return connStr;
  }
  
  // Fallback to direct DATABASE_URL (works for local development with wrangler dev)
  const url = env?.DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('[getDatabaseUrl] ERROR: No connection string found!');
    throw new Error('DATABASE_URL or HYPERDRIVE environment variable is not set');
  }
  console.log('[getDatabaseUrl] Using DATABASE_URL connection string');
  console.log('[getDatabaseUrl] Connection string preview:', url.substring(0, 50) + '...');
  return url;
}

interface Hyperdrive {
  connectionString: string;
}

