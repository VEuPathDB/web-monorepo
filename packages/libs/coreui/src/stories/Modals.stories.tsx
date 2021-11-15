import { Story, Meta } from '@storybook/react/types-6-0';

import { gray } from '../definitions/colors';
import FullScreenModal, {
  FullScreenModalProps,
} from '../components/modals/FullScreenModal';
import { secondaryFont } from '../styleDefinitions/typography';

export default {
  title: 'Overlays/Modals',
  component: FullScreenModal,
} as Meta;

const Template: Story<FullScreenModalProps> = (args) => (
  <FullScreenModal {...args} />
);
export const Default = Template.bind({});
Default.args = {
  visible: true,
  title: 'Example Modal Title',
  onOpen: () => console.log('Modal Opened'),
  children: (
    <div>
      <p css={[{ color: gray[400] }, secondaryFont]}>
        This is an example full-screen modal.
      </p>
      <p css={[{ color: gray[400] }, secondaryFont]}>
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
        sollicitudin. Urna et pharetra pharetra massa massa. Sit amet luctus
        venenatis lectus magna fringilla urna. Vestibulum sed arcu non odio.
        Arcu bibendum at varius vel pharetra vel. Pharetra diam sit amet nisl.
        Magna sit amet purus gravida quis. Est ante in nibh mauris cursus. Nec
        feugiat nisl pretium fusce id velit ut tortor pretium. Libero enim sed
        faucibus turpis in eu. Nec tincidunt praesent semper feugiat nibh sed
        pulvinar. Enim neque volutpat ac tincidunt. Et tortor at risus viverra
        adipiscing at in tellus. Pretium fusce id velit ut tortor pretium
        viverra suspendisse. Sit amet est placerat in egestas erat. Neque
        volutpat ac tincidunt vitae. Aliquet enim tortor at auctor urna nunc id
        cursus. Dolor sit amet consectetur adipiscing elit ut aliquam purus.
        Tortor posuere ac ut consequat semper viverra nam libero justo. Sagittis
        id consectetur purus ut faucibus pulvinar elementum integer. Ut
        porttitor leo a diam.
      </p>
      <p css={[{ color: gray[400] }, secondaryFont]}>
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
        sollicitudin. Urna et pharetra pharetra massa massa. Sit amet luctus
        venenatis lectus magna fringilla urna. Vestibulum sed arcu non odio.
        Arcu bibendum at varius vel pharetra vel. Pharetra diam sit amet nisl.
        Magna sit amet purus gravida quis. Est ante in nibh mauris cursus. Nec
        feugiat nisl pretium fusce id velit ut tortor pretium. Libero enim sed
        faucibus turpis in eu. Nec tincidunt praesent semper feugiat nibh sed
        pulvinar. Enim neque volutpat ac tincidunt. Et tortor at risus viverra
        adipiscing at in tellus. Pretium fusce id velit ut tortor pretium
        viverra suspendisse. Sit amet est placerat in egestas erat. Neque
        volutpat ac tincidunt vitae. Aliquet enim tortor at auctor urna nunc id
        cursus. Dolor sit amet consectetur adipiscing elit ut aliquam purus.
        Tortor posuere ac ut consequat semper viverra nam libero justo. Sagittis
        id consectetur purus ut faucibus pulvinar elementum integer. Ut
        porttitor leo a diam.
      </p>
    </div>
  ),
};
