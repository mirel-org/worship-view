import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getDatabaseUrl } from './config';
import * as schema from './schema';

// For Cloudflare Workers, create a new connection per request
// Hyperdrive handles connection pooling at the proxy level, so creating
// new connections per request is safe and recommended
export function getDb(env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } }) {
  console.log('[getDb] Creating database connection...');
  
  try {
    const connectionString = getDatabaseUrl(env);
    console.log('[getDb] Got connection string, creating postgres client...');
    
    // Create postgres client for this request
    // Hyperdrive handles connection pooling, so we can create new clients per request
    // Configure for Cloudflare Workers compatibility
    const client = postgres(connectionString, {
      max: 1, // Single connection per client instance
      idle_timeout: 20,
      connect_timeout: 10,
      // Important: Don't keep connections alive between requests in Workers
      // Hyperdrive's proxy handles the actual connection pooling
    });
    
    console.log('[getDb] Postgres client created successfully');
    
    console.log('[getDb] Creating drizzle instance...');
    const db = drizzle(client, { schema });
    console.log('[getDb] Drizzle instance created successfully');
    
    // Store client reference on db object so we can close it later
    (db as any).__client = client;
    
    return db;
  } catch (error: any) {
    console.error('[getDb] ERROR creating database client:', error);
    console.error('[getDb] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
}

// Helper function to close the database connection
// Should be called after each request completes
export async function closeDb(db: ReturnType<typeof drizzle>): Promise<void> {
  try {
    const client = (db as any).__client as postgres.Sql | undefined;
    if (client) {
      await client.end();
      console.log('[closeDb] Database connection closed');
    }
  } catch (error) {
    console.error('[closeDb] Error closing database connection:', error);
  }
}

