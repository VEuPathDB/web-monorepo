import { Image } from '@material-ui/icons';
import { colors, SingleSelect, Warning } from '@veupathdb/coreui';
import { PartialButtonStyleSpec } from '@veupathdb/coreui/lib/components/buttons';
import { CSSProperties, useState } from 'react';

export type ExportButtonSize = 'small' | 'medium';

/**
 * Presets for the two supported button sizes. `medium` is the historical
 * appearance (empty overrides + the MUI icon's default 1.5rem). `small`
 * shrinks the button text/dropdown-icon (via `container`) and the leading
 * image icon together so the whole button scales down — used for the
 * per-facet buttons in faceted plots.
 */
const sizePresets: Record<
  ExportButtonSize,
  {
    buttonStyle?: PartialButtonStyleSpec;
    iconFontSize?: CSSProperties['fontSize'];
  }
> = {
  medium: {},
  small: {
    buttonStyle: {
      container: {
        fontSize: '.7rem',
        height: 27,
        paddingLeft: 10,
        paddingRight: 10,
      },
    },
    iconFontSize: '1.1rem',
  },
};

interface ToImageOpts {
  height: number;
  width: number;
  format: 'svg' | 'png';
}

interface ToImage {
  (opts: ToImageOpts): Promise<string>;
}

interface Props {
  filename?: string;
  toImage: ToImage;
  style?: CSSProperties;
  /** Height of image in pixels */
  imageHeight?: number;
  /** Width of image in pixels */
  imageWidth?: number;
  /** Visual size of the button. Defaults to 'medium' (the historical size);
   * 'small' renders a compact button, e.g. for faceted plots. */
  size?: ExportButtonSize;
}

export function ExportPlotToImageButton(props: Props) {
  const {
    filename = 'plot',
    toImage,
    style,
    imageHeight = 450,
    imageWidth = 750,
    size = 'medium',
  } = props;
  const { buttonStyle, iconFontSize } = sizePresets[size];
  const [sawError, setSawError] = useState(false);
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        justifyContent: 'end',
        padding: '.5em 0',
        height: 'auto',
      }}
    >
      <SingleSelect
        items={[
          {
            display: 'SVG',
            value: 'svg',
          } as const,
          {
            display: (
              <>
                PNG &nbsp; <em>(large plots may fail)</em>
              </>
            ),
            value: 'png',
          } as const,
        ]}
        value={undefined}
        onSelect={async (format) => {
          if (format) {
            setSawError(false);
            try {
              await downloadImage(toImage, filename, {
                format,
                height: imageHeight,
                width: imageWidth,
              });
            } catch (error) {
              setSawError(true);
              console.error(error);
            }
          }
        }}
        buttonDisplayContent={
          <>
            <Image style={{ marginRight: '.5ex', fontSize: iconFontSize }} />{' '}
            Export plot
          </>
        }
        styleOverrides={buttonStyle}
      />
      {sawError && (
        <div
          style={{
            fontSize: 'small',
            fontStyle: 'italic',
            color: colors.error[600],
            marginTop: '.2em',
          }}
        >
          An error occurred when trying to export the plot.
        </div>
      )}
    </div>
  );
}

async function downloadImage(
  toImage: ToImage,
  filename: string,
  options: ToImageOpts
) {
  const imgUrl = await toImage(options);
  const downloadLink = document.createElement('a');
  downloadLink.href = imgUrl;
  downloadLink.download = filename + '.' + options.format;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
