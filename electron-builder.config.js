/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'io.hzsec.desktop',
  productName: 'HZSec',
  files: [
    '**/*',
    '!**/*.{ts,map}',
    '!.git/**',
    '!backup-before-*/**',
    '!test-lab/**',
    '!design-reference/**',
    '!HZSec - Growth/**',
    '!.github/**',
  ],
  directories: {
    output: 'dist',
    buildResources: 'build',
  },
  dmg: {
    contents: [
      { x: 110, y: 150 },
      { x: 240, y: 150, type: 'link', path: '/Applications' },
    ],
    window: { width: 500, height: 350 },
  },
  mac: {
    artifactName: 'HZSec-${arch}.${ext}',
    category: 'public.app-category.developer-tools',
    target: ['dmg', 'zip'],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    // teamId read from APPLE_TEAM_ID env var — never hardcoded in the repo
    notarize: process.env.APPLE_TEAM_ID
      ? { teamId: process.env.APPLE_TEAM_ID }
      : false,
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
  win: {
    artifactName: 'HZSec-Setup.${ext}',
    target: ['nsis'],
    publisherName: 'HZSec',
    verifyUpdateCodeSignature: false,
  },
  linux: {
    target: ['AppImage', 'deb'],
    category: 'Development',
  },
  publish: [
    {
      provider: 'github',
      owner: 'HamzaAls-AI',
      repo: 'HZSEC',
    },
  ],
  protocols: [
    {
      name: 'HZSec',
      schemes: ['hzsec'],
    },
  ],
};
