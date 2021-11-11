import { Story, Meta } from '@storybook/react/types-6-0';
import { HeaderProps } from '../components/headers/Header';

import { GRAY, FADED_BLUE, BLUE } from '../definitions/colors';
import typography from '../styleDefinitions/typography';

export default {
  title: 'Color/Palettes',
} as Meta;

const ColorSwatch = (props: { colorKey: number; hexCode: string }) => {
  return (
    <div
      css={{
        width: 200,
        height: 50,
        backgroundColor: props.hexCode,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 5,
        boxSizing: 'border-box',
      }}
    >
      <span
        css={[
          typography.metaData,
          { flex: 1, color: props.colorKey > 200 ? 'white' : GRAY[600] },
        ]}
      >
        {props.colorKey}
      </span>
      <span
        css={[
          typography.metaData,
          {
            flex: 1,
            color: props.colorKey > 200 ? 'white' : GRAY[600],
            textAlign: 'end',
          },
        ]}
      >
        {props.hexCode}
      </span>
    </div>
  );
};

export const Palettes: Story = (args) => (
  <div css={{ display: 'grid', gap: '15px 20px', gridAutoColumns: '1fr' }}>
    {[GRAY, FADED_BLUE, BLUE].map((colorHue) => (
      <div>
        {Object.entries(colorHue).map((entry) => (
          <ColorSwatch colorKey={entry[0]} hexCode={entry[1]} />
        ))}
      </div>
    ))}
  </div>
);
