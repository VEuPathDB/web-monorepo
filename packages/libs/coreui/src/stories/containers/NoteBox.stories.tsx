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
    <div style={{ fontFamily: 'sans-serif' }}>
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
    </div>
  );
};

export const InfoWithoutIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'info',
    showIcon: false,
    children: (
      <div>
        This is some general information about the content that follows on the
        page.
      </div>
    ),
  },
});

export const WarningWithoutIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'warning',
    showIcon: false,
    children: (
      <div>This is a warning about the content that follows on the page.</div>
    ),
  },
});

export const ErrorWithoutIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'error',
    showIcon: false,
    children: (
      <div>
        This is an error message about the content that follows on the page.
      </div>
    ),
  },
});

export const LongContentWithoutIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'info',
    showIcon: false,
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

export const InfoWithIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'info',
    showIcon: true,
    children: (
      <div>
        This is some general information about the content that follows on the
        page.
      </div>
    ),
  },
});

export const WarningWithIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'warning',
    showIcon: true,
    children: (
      <div>This is a warning about the content that follows on the page.</div>
    ),
  },
});

export const ErrorWithIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'error',
    showIcon: true,
    children: (
      <div>
        This is an error message about the content that follows on the page.
      </div>
    ),
  },
});

export const LongContentWithIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'info',
    showIcon: true,
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

export const ExpandableContentWithIcon = Object.assign(Template.bind({}), {
  args: {
    type: 'info',
    showIcon: true,
    children: (
      <details>
        <summary style={{ cursor: 'pointer' }}>
          There are some interesting things about this...
        </summary>
        <p>
          Lorem ipsum odor amet, consectetuer adipiscing elit. Faucibus morbi ac
          ultrices purus urna tristique mattis consequat. Posuere volutpat
          facilisi natoque dictumst dignissim magna dapibus. Taciti vel a etiam
          curabitur velit torquent. Fusce interdum dictum vulputate sollicitudin
          nulla. Orci placerat congue odio aptent enim mauris. Turpis nec
          rhoncus eleifend eleifend eget. Auctor sed nullam vestibulum quisque
          egestas; nullam aenean ante.
        </p>
      </details>
    ),
  },
});
