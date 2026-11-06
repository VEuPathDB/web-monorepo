import { Image } from '@material-ui/icons';
import { colors, SingleSelect, Warning } from '@veupathdb/coreui';
import { CSSProperties, useState } from 'react';
import domtoimage from 'dom-to-image';

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
              const options = {
                format,
                height: imageHeight,
                width: imageWidth,
              };
              const legendStyles = {
                style: {
                  width: '400px',
                  backgroundColor: '#fff',
                },
              };

              // export plotly plot
              await downloadImage(toImage, filename, options);

              // export legend
              if (format === 'svg')
                await domtoimage
                  .toSvg(document.getElementById('plotLegend')!, legendStyles)
                  .then((dataUrl) => {
                    saveImage(dataUrl, filename, options, true);
                  });
              else if (format === 'png')
                await domtoimage
                  .toPng(document.getElementById('plotLegend')!, legendStyles)
                  .then((dataUrl) => {
                    saveImage(dataUrl, filename, options, true);
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
  saveImage(imgUrl, filename, options);
}

function saveImage(
  imgUrl: string,
  filename: string,
  options: ToImageOpts,
  isLegend: boolean = false
) {
  const downloadLink = document.createElement('a');
  downloadLink.href = imgUrl;
  downloadLink.download =
    filename + (isLegend ? 'Legend' : '') + '.' + options.format;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
