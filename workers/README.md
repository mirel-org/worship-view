# Worship View Workers API

Cloudflare Workers backend for Worship View application.

## Setup

1. Install dependencies:
```bash
cd workers
pnpm install
```

2. Set up Hyperdrive for database connections:
```bash
# Create a Hyperdrive configuration
wrangler hyperdrive create worship-view-db --connection-string="postgresql://user:password@host:port/database"
```

This will output a Hyperdrive ID. Add it to `wrangler.toml`:
```toml
[[hyperdrive]]
id = "your-hyperdrive-id-here"
localConnectionString = "postgresql://user:password@localhost:5432/database"  # For local dev
```

**Important**: Cloudflare Workers cannot make direct TCP connections to PostgreSQL. You MUST use Hyperdrive even for local development.

3. For local development, run:
```bash
pnpm dev
```

4. For production deployment:
```bash
pnpm deploy
```

5. Database migrations:
```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly to database (development)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Introspect existing database
pnpm db:introspect
```

## Environment Variables

### Local Development

Create a `.env` file in the `workers/` directory:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

For local development with `wrangler dev`, you can use `DATABASE_URL` directly. Make sure your database is accessible from your local machine.

### Production Deployment

**Important**: Cloudflare Workers cannot make direct TCP connections to PostgreSQL. You must use **Hyperdrive** for production.

#### Setting up Hyperdrive:

1. Create a Hyperdrive configuration:
```bash
wrangler hyperdrive create worship-view-db --connection-string="postgresql://user:password@host:port/database"
```

2. This will output a Hyperdrive ID. Add it to your `wrangler.toml`:
```toml
[[hyperdrive]]
id = "your-hyperdrive-id-here"
```

3. The Hyperdrive connection string will be automatically available as `env.HYPERDRIVE.connectionString` in your worker code.

#### Alternative: Using DATABASE_URL Secret (for local dev only)

For local development only, you can set `DATABASE_URL` as a secret:
```bash
wrangler secret put DATABASE_URL
```

**Note**: Direct `DATABASE_URL` connections will NOT work in production Cloudflare Workers. You must use Hyperdrive.

