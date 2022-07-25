import { useState, useEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import { mutedGreen, mutedMagenta } from '../../definitions/colors';
import CoreUIModal, { ModalProps } from '../../components/containers/Modal';
import { FilledButton } from '../../components/buttons';
import { UIThemeProvider } from '../../components/theming';
import { H1, Paragraph } from '../../components/typography';

const ModalContent = ({
  themeRole,
}: {
  themeRole: 'primary' | 'secondary';
}) => (
  <div
    css={{
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <div>
      <Paragraph textSize='medium'>This is an example of a modal.</Paragraph>
      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Mi quis hendrerit
        dolor magna eget est. Donec enim diam vulputate ut pharetra sit amet.
        Viverra nam libero justo laoreet sit amet cursus. Pretium vulputate
        sapien nec sagittis. Convallis aenean et tortor at risus viverra
        adipiscing at in. Maecenas ultricies mi eget mauris pharetra et ultrices
        neque ornare. Maecenas ultricies mi eget mauris pharetra et ultrices
        neque. Aliquet nibh praesent tristique magna sit. Laoreet sit amet
        cursus sit amet. Scelerisque varius morbi enim nunc faucibus a. Et
        tortor at risus viverra adipiscing at in tellus. Fermentum posuere urna
        nec tincidunt praesent. Mi in nulla posuere sollicitudin aliquam
        ultrices sagittis. Purus faucibus ornare suspendisse sed nisi lacus sed.
        Sed libero enim sed faucibus turpis. Gravida in fermentum et
        sollicitudin. Urna et pharetra pharetra massa massa.
      </Paragraph>
    </div>
    <FilledButton
      text='Example Button'
      onPress={() => null}
      themeRole={themeRole}
    />
  </div>
);

export default {
  title: 'Containers/Modal',
  component: CoreUIModal,
} as Meta;

const Template: Story<ModalProps> = (args) => {
  const { visible, ...rest } = args;

  const [modalVisible, setModalVisible] = useState<boolean>(args.visible);
  useEffect(() => setModalVisible(args.visible), [args.visible]);

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: mutedGreen, level: 500 },
          secondary: { hue: mutedMagenta, level: 500 },
        },
      }}
    >
      <H1 text='Background Content' />
      <CoreUIModal
        {...rest}
        visible={modalVisible}
        toggleVisible={setModalVisible}
      >
        <ModalContent themeRole={args.themeRole} />
      </CoreUIModal>
    </UIThemeProvider>
  );
};
export const Basic = Template.bind({});
Basic.args = {
  visible: true,
  styleOverrides: {
    content: {
      padding: {
        top: 0,
        right: 50,
        bottom: 25,
        left: 25,
      },
    },
  },
} as ModalProps;

export const WithTitle = Template.bind({});
WithTitle.args = {
  ...Basic.args,
  title: 'Share Large Analysis',
} as ModalProps;

export const WithReactNodeTitle = Template.bind({});
WithReactNodeTitle.args = {
  ...Basic.args,
  title: (
    <span>
      <i>Span</i> element used as a title
    </span>
  ),
} as ModalProps;

export const WithSubtitle = Template.bind({});
WithSubtitle.args = {
  ...Basic.args,
  title: 'Share Large Analysis',
  subtitle: 'The subtitle is under the main title!',
} as ModalProps;

export const IncludeCloseButton = Template.bind({});
IncludeCloseButton.args = {
  ...Basic.args,
  title: 'Modal With Close Button',
  includeCloseButton: true,
} as ModalProps;

export const OpenCloseCallbacks = Template.bind({});
OpenCloseCallbacks.args = {
  ...Basic.args,
  title: 'Modal With Close Button',
  includeCloseButton: true,
  onOpen: () => console.log('Modal Open Callback'),
  onClose: () => console.log('Modal Close Callback'),
} as ModalProps;

export const SpecificSize = Template.bind({});
SpecificSize.args = {
  ...IncludeCloseButton.args,
  title: 'Specifically Sized Modal',
  includeCloseButton: true,
  styleOverrides: {
    size: {
      width: 700,
      height: 500,
    },
    content: {
      padding: {
        top: 0,
        right: 50,
        bottom: 25,
        left: 25,
      },
    },
  },
} as ModalProps;

export const UsingTheme = Template.bind({});
UsingTheme.args = {
  ...IncludeCloseButton.args,
  title: 'Using Theme Styling',
  themeRole: 'primary',
} as ModalProps;

export const CustomContentPadding = Template.bind({});
CustomContentPadding.args = {
  ...IncludeCloseButton.args,
  title: 'Customized Content Padding',
  styleOverrides: {
    content: {
      padding: {
        bottom: 100,
        left: 50,
        right: 50,
        top: 100,
      },
    },
  },
} as ModalProps;
