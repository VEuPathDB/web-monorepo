import React, { CSSProperties, useState } from 'react';
import { Image } from '@material-ui/icons';
import { colors, SingleSelect } from '@veupathdb/coreui';

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
}

export function ExportPlotToImageButton(props: Props) {
  const {
    filename = 'plot',
    toImage,
    style,
    imageHeight = 450,
    imageWidth = 750,
  } = props;
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
            <Image style={{ marginRight: '.5ex' }} /> Export plot
          </>
        }
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
