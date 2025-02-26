import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import { screenReaderOnly } from '../../../styleDefinitions/typography';

interface Props {
  className?: string;
  /** Text makes this dismiss button accessible and more testable. */
  buttonText: string;
  tooltipText?: string;
  size?: number;
  onClick?: () => void;
}

/** gear icon */
export default function SettingsButton(props: Props) {
  return (
    <button
      type="button"
      className={props.className}
      onClick={props.onClick}
      title={props.tooltipText}
      css={{
        border: 'none',
        background: 'transparent',
        padding: 'none',
        margin: 'none',
        cursor: 'pointer',
      }}
    >
      <SettingsOutlinedIcon
        css={{
          verticalAlign: 'middle',
        }}
        style={{
          fontSize: props.size,
        }}
      />
      <span css={screenReaderOnly}>{props.buttonText}</span>
    </button>
  );
}
