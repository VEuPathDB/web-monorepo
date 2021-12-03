import { Story, Meta } from '@storybook/react/types-6-0';

import { gray, mutedGreen, mutedMagenta } from '../../definitions/colors';
import UIModal, { UIModalProps } from '../../components/modals/UIModal';
import { secondaryFont } from '../../styleDefinitions/typography';
import { UIThemeProvider } from '../../components/theming';
import { useState } from 'react';
import { useEffect } from 'react';

const ModalContent = () => (
  <div>
    <p css={[{ color: gray[500] }, secondaryFont]}>
      This is an example full-screen modal.
    </p>
    <p css={[{ color: gray[500] }, secondaryFont]}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Mi quis hendrerit
      dolor magna eget est. Donec enim diam vulputate ut pharetra sit amet.
      Viverra nam libero justo laoreet sit amet cursus. Pretium vulputate sapien
      nec sagittis. Convallis aenean et tortor at risus viverra adipiscing at
      in. Maecenas ultricies mi eget mauris pharetra et ultrices neque ornare.
      Maecenas ultricies mi eget mauris pharetra et ultrices neque. Aliquet nibh
      praesent tristique magna sit. Laoreet sit amet cursus sit amet.
      Scelerisque varius morbi enim nunc faucibus a. Et tortor at risus viverra
      adipiscing at in tellus. Fermentum posuere urna nec tincidunt praesent. Mi
      in nulla posuere sollicitudin aliquam ultrices sagittis. Purus faucibus
      ornare suspendisse sed nisi lacus sed. Sed libero enim sed faucibus
      turpis. Gravida in fermentum et sollicitudin. Urna et pharetra pharetra
      massa massa.
    </p>
    <p css={[{ color: gray[500] }, secondaryFont]}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Mi quis hendrerit
      dolor magna eget est. Donec enim diam vulputate ut pharetra sit amet.
      Viverra nam libero justo laoreet sit amet cursus. Pretium vulputate sapien
      nec sagittis. Convallis aenean et tortor at risus viverra adipiscing at
      in. Maecenas ultricies mi eget mauris pharetra et ultrices neque ornare.
      Maecenas ultricies mi eget mauris pharetra et ultrices neque. Aliquet nibh
      praesent tristique magna sit. Laoreet sit amet cursus sit amet.
      Scelerisque varius morbi enim nunc faucibus a. Et tortor at risus viverra
      adipiscing at in tellus.
    </p>
  </div>
);

export default {
  title: 'Overlays/Modals/UIModal',
  component: UIModal,
} as Meta;

const Template: Story<UIModalProps> = (args) => {
  const { visible, ...rest } = args;

  const [modalVisible, setModalVisible] = useState(args.visible);
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
      <UIModal
        {...rest}
        visible={modalVisible}
        toggleVisible={setModalVisible}
      />
    </UIThemeProvider>
  );
};
export const Basic = Template.bind({});
Basic.args = {
  visible: true,
  onOpen: () => console.log('Modal Opened'),
  children: <ModalContent />,
};

export const WithTitle = Template.bind({});
WithTitle.args = {
  visible: true,
  title: 'Share Large Analysis',
  onOpen: () => console.log('Modal Opened'),
  children: <ModalContent />,
};

export const IncludeCloseButton = Template.bind({});
IncludeCloseButton.args = {
  visible: true,
  title: 'Modal With Close Button',
  includeCloseButton: true,
  onOpen: () => console.log('Modal Opened'),
  children: <ModalContent />,
};

export const SpecificSize = Template.bind({});
SpecificSize.args = {
  visible: true,
  title: 'Specifically Sized Modal',
  includeCloseButton: true,
  onOpen: () => console.log('Modal Opened'),
  children: <ModalContent />,
  styleOverrides: {
    size: {
      width: 700,
      height: 400,
    },
  },
};

export const UsingTheme = Template.bind({});
UsingTheme.args = {
  ...IncludeCloseButton.args,
  themeRole: 'primary',
};
