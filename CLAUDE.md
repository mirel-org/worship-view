# CLAUDE.md - Project Guide

## Project Overview

**Worship View** is an Electron + React desktop application for viewing and editing worship songs. It provides tools for managing songs, Bible verses, prayer content, and multiple display screens for presentations in worship settings.

## Tech Stack

- **Desktop Framework:** Electron v37 with Electron Forge
- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4
- **State Management:** Jotai (atoms), TanStack React Query
- **Real-time Sync:** Jazz Tools (collaborative data framework)
- **UI Components:** Radix UI primitives, shadcn/ui, Lucide icons
- **Package Manager:** pnpm

## Commands

```bash
pnpm start         # Start dev server with hot reload
pnpm run package   # Package the app
pnpm run make      # Create platform installers (DMG, EXE, deb, rpm)
pnpm run lint      # Run ESLint
pnpm run lint:fix  # Auto-fix lint issues
pnpm run type-check # TypeScript type checking
```

## Project Structure

```
src/
├── main/           # Electron main process
├── renderer/       # React UI (renderer process)
│   ├── components/ # React components (tabs, panels, screens, settings, ui)
│   ├── lib/        # Utilities, hooks, Jazz schema
│   └── styles/     # CSS styles
├── preload/        # Preload script (context bridge)
├── ipc/            # Inter-Process Communication handlers
└── common/         # Shared utilities and types
```

## Path Aliases

```
@/           → src/renderer
@renderer/   → src/renderer
@main/       → src/main
@ipc/        → src/ipc
@common/     → src/common
@assets/     → assets/
```

## Architecture

- **Main Process** (`src/main/`): Window management, file protocols
- **Renderer Process** (`src/renderer/`): React UI
- **Preload Script** (`src/preload/`): Secure context bridge
- **IPC Bridge** (`src/ipc/`): Organized by domain (display, media, song, verse, prayer, projection, screen, settings)

## Key Patterns

1. **IPC Communication:** All main process interactions go through `src/ipc/` modules
2. **State:** Jotai atoms for global state, React Query for server state
3. **Components:** UI primitives in `components/ui/`, feature components in domain folders
4. **Jazz:** Real-time collaboration via Jazz Tools - requires API key in `.env`
   - **Documentation:** See `@jazz-tools-docs.txt` for Jazz API reference

## Environment Variables

```
VITE_JAZZ_API_KEY=<api-key>  # Required for collaborative features
```

## Electron Security

- Context isolation enabled
- Node integration disabled
- Preload script for controlled API exposure
- Custom `local-files://` protocol for asset loading

## Code Style

- TypeScript strict mode
- ESLint with React hooks rules
- Prettier: single quotes, trailing commas, JSX single quotes
- No React import needed (React 18+ JSX runtime)
