import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  blockHosts: [
    // These will appear as 503's in the network tab.
    // If you need something, stub it out!
    '**.com',
    '**.org',
  ],
});
