import Close from "@material-ui/icons/Close";
import { screenReaderOnly } from "../../styleDefinitions/typography";

interface Props {
  className?: string;
  /** Text makes this dismiss button accessible and more testable. */
  buttonText: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/** Button suitable for dismissible notifications */
export default function DismissButton(props: Props) {
  return (
    <button
      type="button"
      className={props.className}
      onClick={props.onClick}
      css={{
        border: "none",
        background: "transparent",
        padding: "none",
        margin: "none",
        cursor: "pointer",
      }}
    >
      <Close
        height="1.5em"
        width="1.5em"
        css={{
          verticalAlign: "middle",
        }}
      />
      <span css={screenReaderOnly}>{props.buttonText}</span>
    </button>
  );
}
