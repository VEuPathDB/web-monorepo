function loadConfig(siteConfig: { [K in string]?: string }) {
  window.__SITE_CONFIG__ = siteConfig;
  let config: typeof import('./config') | undefined;
  jest.isolateModules(() => {
    config = require('./config');
  });
  return config!;
}

describe('strategistUrl', () => {
  it('reads the Strategist address', () => {
    expect(loadConfig({ strategistUrl: '/strategist' }).strategistUrl).toBe(
      '/strategist'
    );
  });

  it('reads the address a site still sets under its former name', () => {
    expect(loadConfig({ pathfinderUrl: '/pathfinder' }).strategistUrl).toBe(
      '/pathfinder'
    );
  });

  it('prefers the Strategist address when a site sets both', () => {
    expect(
      loadConfig({ strategistUrl: '/strategist', pathfinderUrl: '/pathfinder' })
        .strategistUrl
    ).toBe('/strategist');
  });

  it('is empty when a site sets neither', () => {
    expect(loadConfig({}).strategistUrl).toBe('');
  });
});
