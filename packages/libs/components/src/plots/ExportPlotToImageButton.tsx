import { Image } from '@material-ui/icons';
import { colors, SingleSelect, Warning } from '@veupathdb/coreui';
import { CSSProperties, useState } from 'react';

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
}

export function ExportPlotToImageButton(props: Props) {
  const { filename = 'plot', toImage, style } = props;
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
        onSelect={async (value) => {
          if (value) {
            setSawError(false);
            try {
              await downloadImage(toImage, filename, value);
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
  ext: ToImageOpts['format']
) {
  const imgUrl = await toImage({ height: 450, width: 750, format: ext });
  const downloadLink = document.createElement('a');
  downloadLink.href = imgUrl;
  downloadLink.download = filename + '.' + ext;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
