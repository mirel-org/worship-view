// Forge Configuration
const path = require('path');
const rootDir = process.cwd();
const packageJson = require(path.join(rootDir, 'package.json'));

// Parse GitHub repository from package.json
const getRepoInfo = () => {
  if (packageJson.repository && packageJson.repository.url) {
    const match = packageJson.repository.url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) {
      return {
        owner: match[1],
        name: match[2],
      };
    }
  }
  // Fallback - should be updated with actual repository info
  return {
    owner: 'codesbiome',
    name: 'electron-react-webpack-typescript-2020',
  };
};

const repoInfo = getRepoInfo();
const executableName =
  process.platform === 'linux' ? 'worship-view' : 'Worship View';

module.exports = {
  // Packager Config
  packagerConfig: {
    // Create asar archive for main, renderer process files
    asar: true,
    // Keep a filesystem-safe executable name for Linux packaging (.deb/.rpm expect this binary name),
    // while preserving existing executable naming on macOS/Windows for update continuity.
    executableName,
    // Set application copyright
    appCopyright: `Copyright (C) ${new Date().getFullYear()} ${packageJson.author?.name || 'Worship View'}`,
  },
  // Forge Makers
  makers: [
    {
      // ZIP for macOS (DMG is the primary installer, ZIP needed for update-electron-app on macOS)
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      // Squirrel.Windows installer — produces Setup.exe + .nupkg for auto-updates
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        name: 'worship_view',
        setupExe: 'WorshipViewSetup.exe',
        setupIcon: path.resolve(rootDir, 'assets/images/appIcon.ico'),
        noMsi: true,
      },
    },
    {
      // The DMG target builds .dmg files for macOS distribution.
      // DMG files are the standard disk image format for macOS applications.
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        background: undefined,
        format: 'UDZO',
      },
    },
    {
      // The deb target builds .deb packages, which are the standard package format for Debian-based
      // Linux distributions such as Ubuntu.
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {},
    },
    {
      // The RPM target builds .rpm files, which is the standard package format for
      // RedHat-based Linux distributions such as Fedora.
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {},
    },
  ],
  // Forge Plugins
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // Build configuration for main process and preload scripts
        build: [
          {
            entry: path.join(rootDir, 'src/main/index.ts'),
            config: path.join(rootDir, 'vite.main.config.mjs'),
          },
          {
            entry: path.join(rootDir, 'src/preload/index.tsx'),
            config: path.join(rootDir, 'vite.preload.config.mjs'),
            name: 'app_window_preload',
          },
        ],
        // Renderer configuration
        renderer: [
          {
            name: 'app_window',
            config: path.join(rootDir, 'vite.renderer.config.mjs'),
          },
        ],
      },
    },
  ],
  // Forge Publishers
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: repoInfo.owner,
          name: repoInfo.name,
        },
        prerelease: false,
      },
    },
  ],
};
