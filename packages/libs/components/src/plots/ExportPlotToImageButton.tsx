import { Image } from '@material-ui/icons';
import { SingleSelect } from '@veupathdb/coreui';

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
}

export function ExportPlotToImageButton(props: Props) {
  const { filename = 'plot', toImage } = props;
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'end',
        padding: '.5em 0',
      }}
    >
      <SingleSelect
        items={[
          {
            display: 'SVG',
            value: 'svg',
          } as const,
          {
            display: 'PNG',
            value: 'png',
          } as const,
        ]}
        value={undefined}
        onSelect={(value) => {
          if (value) {
            downloadImage(toImage, filename, value);
          }
        }}
        buttonDisplayContent={
          <>
            <Image style={{ marginRight: '.5ex' }} /> Export plot
          </>
        }
      />
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
