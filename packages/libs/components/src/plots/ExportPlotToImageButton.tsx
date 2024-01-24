import { Image } from '@material-ui/icons';
import { FloatingButton } from '@veupathdb/coreui';

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
  const ext = 'svg';
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'end',
        padding: '.5em 0',
      }}
    >
      <FloatingButton
        onPress={() => downloadPng(toImage, filename, ext)}
        text={`Export to ${ext.toUpperCase()}`}
        icon={Image}
        themeRole="primary"
        textTransform="none"
        size="small"
      />
    </div>
  );
}

async function downloadPng(
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
