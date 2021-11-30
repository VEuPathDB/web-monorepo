import { Story, Meta } from '@storybook/react/types-6-0';

import {
  gray,
  mutedBlue,
  blue,
  teal,
  green,
  yellow,
  orange,
  red,
  magenta,
  purple,
  tan,
  mutedTeal,
  mutedGreen,
  mutedYellow,
  mutedOrange,
  mutedRed,
  mutedMagenta,
  mutedPurple,
} from '../definitions/colors';
import typography from '../styleDefinitions/typography';
import ColorPalettesMDX from './ColorPalettes.mdx';

export default {
  title: 'Color/Palettes',
  parameters: {
    docs: {
      page: ColorPalettesMDX,
    },
  },
} as Meta;

const ColorSwatch = (props: { colorKey: number; hexCode: string }) => {
  return (
    <div
      css={{
        width: 200,
        height: 35,
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
          { flex: 1, color: props.colorKey > 200 ? 'white' : gray[600] },
        ]}
      >
        {props.colorKey}
      </span>
      <span
        css={[
          typography.metaData,
          {
            flex: 1,
            color: props.colorKey > 200 ? 'white' : gray[600],
            textAlign: 'end',
          },
        ]}
      >
        {props.hexCode}
      </span>
    </div>
  );
};

const NeutralColors = () => (
  <div css={{ display: 'flex', flexWrap: 'wrap' }}>
    {[gray, tan].map((colorHue) => (
      <div css={{ marginRight: 20, marginBottom: 20 }}>
        {Object.entries(colorHue).map((entry) => (
          <ColorSwatch colorKey={+entry[0]} hexCode={entry[1]} />
        ))}
      </div>
    ))}
  </div>
);

const MutedColors = () => (
  <div css={{ display: 'flex', flexWrap: 'wrap' }}>
    {[
      mutedBlue,
      mutedTeal,
      mutedGreen,
      mutedYellow,
      mutedOrange,
      mutedRed,
      mutedMagenta,
      mutedPurple,
    ].map((colorHue) => (
      <div css={{ marginRight: 20, marginBottom: 20 }}>
        {Object.entries(colorHue).map((entry) => (
          <ColorSwatch colorKey={+entry[0]} hexCode={entry[1]} />
        ))}
      </div>
    ))}
  </div>
);

const VibrantColors = () => (
  <div css={{ display: 'flex', flexWrap: 'wrap' }}>
    {[blue, teal, green, yellow, orange, red, magenta, purple].map(
      (colorHue) => (
        <div css={{ marginRight: 20, marginBottom: 20 }}>
          {Object.entries(colorHue).map((entry) => (
            <ColorSwatch colorKey={+entry[0]} hexCode={entry[1]} />
          ))}
        </div>
      )
    )}
  </div>
);

export const Neutral: Story = (args) => <NeutralColors />;
export const Vibrant: Story = (args) => <VibrantColors />;
export const Muted: Story = (args) => <MutedColors />;
