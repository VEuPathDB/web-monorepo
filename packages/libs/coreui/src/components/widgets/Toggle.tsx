import { CSSProperties } from "react";
import { Subset } from "../../definitions/types";

import { ColorDescriptor, ThemeRole } from "../theming/types";
import { useMemo, useState } from "react";

// Definitions
import { primaryFont } from "../../styleDefinitions/typography";
import { blue } from "@material-ui/core/colors";
import { gray } from "../../definitions/colors";
import { useUITheme } from "../theming";
import { merge, uniqueId } from "lodash";
import { ParagraphStyleSpec } from "../typography/Paragraph";

// Type definitions for working with styles.
type ToggleColorStyleSpec = {
  backgroundColor: CSSProperties["color"];
  labelColor: CSSProperties["color"];
  knobColor: CSSProperties["color"];
  borderColor: CSSProperties["color"];
};

type ToggleValueStyleSpec = {
  off: ToggleColorStyleSpec;
  on: ToggleColorStyleSpec;
};

type ToggleStyleSpec = {
  container: React.CSSProperties;
  default: ToggleValueStyleSpec;
  hover: ToggleValueStyleSpec;
  disabled: ToggleValueStyleSpec;
  label?: Partial<ParagraphStyleSpec>;
  mainColor?: ColorDescriptor;
};

type ToggleStyleSpecSubset = Subset<ToggleStyleSpec>;

// Prop definitions.
export type ToggleProps = {
  /** Whether the toggle is off (false) or on (true). */
  value: boolean;
  /** Callback to invoke when the toggle is flipped. */
  onChange: (state: boolean) => void;
  /** Whether the component is currently disabled for user interactions. Optional. */
  disabled?: boolean;
  /** Node to render beside the toggle. If label is provided, aria-labelledby
   * will be used to connect the label's text to the toggle. If the label does
   * not include descriptive text, an ariaLabel prop should be included to
   * override this behavior. */
  label?: React.ReactNode;
  /** Position of label. Optional, defaults to left. */
  labelPosition?: "left" | "right";
  /** ARIA label to apply. Not needed if a label prop with descriptive text is
   * provided. Optional. */
  ariaLabel?: string;
  /** Primary or secondary. Optional. */
  themeRole?: ThemeRole;
  /** Size of toggle. Optional, defaults to medium. */
  size?: "medium" | "small";
  /** Specification on how toggle should be styled. Optional. */
  styleOverrides?: ToggleStyleSpecSubset;
};

/** Fully controlled Toggle component. */
export default function Toggle({
  value,
  onChange,
  disabled,
  label,
  labelPosition = "left",
  ariaLabel,
  themeRole,
  size = "medium",
  styleOverrides,
}: ToggleProps) {
  const theme = useUITheme();
  const [hoverState, setHoverState] = useState<"default" | "hover">("default");

  const styleSpec: ToggleStyleSpec = useMemo(() => {
    const mainColor =
      styleOverrides?.mainColor ??
      (theme && themeRole
        ? theme.palette[themeRole]
        : { hue: blue, level: 400 });
    const mainHue = mainColor.hue;
    const mainLevel = mainColor.level;
    const enabledLabelColor = gray[900];
    const disabledColor = gray[300];

    const defaultStyleSpec: ToggleStyleSpec = {
      container: {},
      default: {
        off: {
          backgroundColor: "none",
          knobColor: mainHue[mainLevel],
          borderColor: mainHue[mainLevel],
          labelColor: enabledLabelColor,
        },
        on: {
          backgroundColor: mainHue[mainLevel],
          knobColor: "white",
          borderColor: mainHue[mainLevel],
          labelColor: enabledLabelColor,
        },
      },
      hover: {
        off: {
          backgroundColor: mainHue[100],
          knobColor: mainHue[mainLevel],
          borderColor: mainHue[mainLevel],
          labelColor: enabledLabelColor,
        },
        on: {
          backgroundColor: mainHue[Math.min(mainLevel + 200, 900)],
          knobColor: "white",
          borderColor: mainHue[Math.min(mainLevel + 200, 900)],
          labelColor: enabledLabelColor,
        },
      },
      disabled: {
        off: {
          backgroundColor: "none",
          knobColor: disabledColor,
          borderColor: disabledColor,
          labelColor: disabledColor,
        },
        on: {
          backgroundColor: disabledColor,
          knobColor: "white",
          borderColor: disabledColor,
          labelColor: disabledColor,
        },
      },
      label: {
        fontFamily: `'Roboto', 'San Francisco', 'Frutiger', 'Univers', 'Helvetica Neue', 'Helvetica'`,
      }
    };

    return merge({}, defaultStyleSpec, styleOverrides);
  }, [styleOverrides, theme, themeRole]);

  /**
   * The CSS styles that should be applied can depend
   * on (1) whether or not the component is
   * focused/hovered, (2) which option is selected,
   * and (3) whether the toggle is disabled.
   */
  const currentStyles = useMemo(() => {
    const selectedOption = value ? "on" : "off";

    return disabled
      ? styleSpec.disabled[selectedOption]
      : styleSpec[hoverState][selectedOption];
  }, [hoverState, value, styleSpec, disabled]);

  const finalAriaLabel =
    ariaLabel ?? (label !== undefined ? undefined : "Toggle");
  const labelId = useMemo(
    () =>
      ariaLabel === undefined && label !== undefined
        ? uniqueId("toggle-label-")
        : undefined,
    [label, ariaLabel]
  );

  const width = size === "medium" ? 30 : 20;
  const height = size === "medium" ? 17 : 11;
  const borderWidth = size === "medium" ? 1.5 : 1;
  const knobSize = size === "medium" ? 9 : 6;
  const knobOffset = size === "medium" ? 3 : 2;

  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        pointerEvents: disabled ? "none" : "auto",
        fontFamily: primaryFont,
        fontSize: 13,
        fontWeight: 400,
        ...styleSpec.container,
      }}
    >
      {label && labelPosition === "left" && (
        <span
          css={{
            marginRight: size === "medium" ? 10 : 5,
            color: currentStyles.labelColor,
            ...styleSpec.label,
          }}
          id={labelId}
        >
          {label}
        </span>
      )}
      <div
        role="switch"
        aria-label={finalAriaLabel}
        aria-labelledby={labelId}
        aria-checked={value}
        css={{
          display: "flex",
          position: "relative",
          boxSizing: "border-box",
          transition: "all ease .33s",
          alignItems: "center",
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: currentStyles.backgroundColor,
          ...(currentStyles.borderColor
            ? {
                borderColor: currentStyles.borderColor,
                borderWidth,
                borderStyle: "solid",
              }
            : {
                border: "none",
              }),
        }}
        onKeyDown={(event) => {
          if (["Space", "Enter"].includes(event.code)) {
            onChange(!value);
          }
        }}
        onFocus={() => setHoverState("hover")}
        onBlur={() => setHoverState("default")}
        onMouseEnter={() => setHoverState("hover")}
        onMouseLeave={() => setHoverState("default")}
        onClick={() => onChange(!value)}
        tabIndex={0}
      >
        <div
          css={{
            position: "absolute",
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            left: !value
              ? knobOffset
              : width - knobSize - 2 * borderWidth - knobOffset,
            transition: "ease all .33s",
            backgroundColor: currentStyles.knobColor,
          }}
        />
      </div>
      {label && labelPosition === "right" && (
        <span
          css={{
            marginLeft: size === "medium" ? 10 : 5,
            color: currentStyles.labelColor,
            ...styleSpec.label,
          }}
          id={labelId}
        >
          {label}
        </span>
      )}
    </div>
  );
}
