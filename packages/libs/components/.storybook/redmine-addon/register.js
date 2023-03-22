import * as React from 'react';
import addons, { types } from '@storybook/addons';
import { useParameter } from '@storybook/api';

const ADDON_ID = 'redmine';

addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    title: 'redmine',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => {
      const redmineUrl = useParameter('redmine');
      if (redmineUrl == null) return null;
      return (
        <a style={{ alignSelf: 'center' }} target="_blank" href={redmineUrl}>
          Redmine issue
        </a>
      );
    },
  });
});
