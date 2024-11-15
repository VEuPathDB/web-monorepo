import React from 'react';
import { NoteBox, Props } from '../../components/containers/NoteBox';
import { Story, Meta } from '@storybook/react/types-6-0';
import { UIThemeProvider } from '../../components/theming';
import { mutedGreen, mutedMagenta } from '../../definitions/colors';

export default {
  title: 'Containers/NoteBox',
  component: NoteBox,
} as Meta;

const Template: Story<Props> = function Template(props) {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: mutedGreen, level: 500 },
          secondary: { hue: mutedMagenta, level: 500 },
        },
      }}
    >
      <NoteBox {...props} />
    </UIThemeProvider>
  );
};

export const Info = Object.assign(Template.bind({}), {
  args: {
    type: 'info',
    children: (
      <div>
        This is some general information about the content that follows on the
        page.
      </div>
    ),
  },
});

export const Warning = Object.assign(Template.bind({}), {
  args: {
    type: 'warning',
    children: (
      <div>This is a warning about the content that follows on the page.</div>
    ),
  },
});

export const Error = Object.assign(Template.bind({}), {
  args: {
    type: 'error',
    children: (
      <div>
        This is an error message about the content that follows on the page.
      </div>
    ),
  },
});

export const LongContent = Object.assign(Template.bind({}), {
  args: {
    type: 'info',
    children: (
      <div>
        Lorem ipsum odor amet, consectetuer adipiscing elit. Faucibus morbi ac
        ultrices purus urna tristique mattis consequat. Posuere volutpat
        facilisi natoque dictumst dignissim magna dapibus. Taciti vel a etiam
        curabitur velit torquent. Fusce interdum dictum vulputate sollicitudin
        nulla. Orci placerat congue odio aptent enim mauris. Turpis nec rhoncus
        eleifend eleifend eget. Auctor sed nullam vestibulum quisque egestas;
        nullam aenean ante.
      </div>
    ),
  },
});
