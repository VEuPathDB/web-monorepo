import '@storybook/addon-console';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

// storybook v6 seems to have default margin so remove it - https://github.com/storybookjs/storybook/issues/12109
export const parameters = {
  controls: { expanded: true },
  layout: 'fullscreen',
};

// wrap all stories in react-query (for useQuery hook)
const queryClient = new QueryClient();
export const decorators = [
  (Story) => (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  ),
];
