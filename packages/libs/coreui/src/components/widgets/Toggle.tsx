import { CSSProperties } from "react";
import { Subset } from "../../definitions/types";

import { ThemeRole } from "../theming/types";
import { useMemo, useState } from "react";

// Definitions
import { primaryFont } from "../../styleDefinitions/typography";
import { blue } from "@material-ui/core/colors";
import { gray } from "../../definitions/colors";
import { useUITheme } from "../theming";
import { merge, uniqueId } from "lodash";

// Type definitions for working with styles.
type ToggleColorStyleSpec = {
  backgroundColor: CSSProperties["color"];
  labelColor: CSSProperties["color"];
  knobColor: CSSProperties["color"];
  borderColor: CSSProperties["color"];
};

type ToggleStateStyleSpec = {
  off: ToggleColorStyleSpec;
  on: ToggleColorStyleSpec;
};

type ToggleStyleSpec = {
  container: React.CSSProperties;
  default: ToggleStateStyleSpec;
  hover: ToggleStateStyleSpec;
  disabled: ToggleStateStyleSpec;
};

type ToggleStyleSpecSubset = Subset<ToggleStyleSpec>;

// Prop definitions.
export type ToggleProps = {
  /** Whether the toggle is off (false) or on (true). */
  value: boolean;
  /** Callback to invoke when the toggle is flipped. */
  onToggle: (state: boolean) => void;
  /** Whether the component is currently disabled for user interactions. Optional. */
  disabled?: boolean;
  /** Node to render beside the toggle. If this is a string, it's also used as
   * the ARIA label unless the ariaLabel prop is also defined. Optional. */
  label?: React.ReactNode;
  /** Position of label. Optional, defaults to left. */
  labelPosition?: "left" | "right";
  /** ARIA label to apply. Optional but highly recommended. */
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
  onToggle,
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
    const themeColor = theme && themeRole && theme.palette[themeRole];
    const mainColor = themeColor?.hue ?? blue;
    const mainLevel = themeColor?.level ?? 400;
    const labelColor = gray[600];
    const disabledColor = gray[300];

    const defaultStyleSpec: ToggleStyleSpec = {
      container: {},
      default: {
        off: {
          backgroundColor: "none",
          knobColor: mainColor[mainLevel],
          borderColor: mainColor[mainLevel],
          labelColor,
        },
        on: {
          backgroundColor: mainColor[mainLevel],
          knobColor: "white",
          borderColor: mainColor[mainLevel],
          labelColor,
        },
      },
      hover: {
        off: {
          backgroundColor: mainColor[100],
          knobColor: mainColor[mainLevel],
          borderColor: mainColor[mainLevel],
          labelColor,
        },
        on: {
          backgroundColor: mainColor[Math.min(mainLevel + 200, 900)],
          knobColor: "white",
          borderColor: mainColor[Math.min(mainLevel + 200, 900)],
          labelColor,
        },
      },
      disabled: {
        off: {
          backgroundColor: "none",
          knobColor: disabledColor,
          borderColor: disabledColor,
          labelColor,
        },
        on: {
          backgroundColor: disabledColor,
          knobColor: "white",
          borderColor: disabledColor,
          labelColor,
        },
      },
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
    ariaLabel ?? (typeof label === "string" ? undefined : "Toggle");
  const labelId = useMemo(
    () =>
      ariaLabel === undefined && typeof label === "string"
        ? uniqueId("toggle-label-")
        : undefined,
    [label, ariaLabel]
  );

  const width = size === "medium" ? 40 : 20;
  const height = width / 2;
  const borderWidth = 2;
  const knobSize = size === "medium" ? 12 : 5;
  const knobOffset = size === "medium" ? 2 : 1;

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
            onToggle(!value);
          }
        }}
        onFocus={() => setHoverState("hover")}
        onBlur={() => setHoverState("default")}
        onMouseEnter={() => setHoverState("hover")}
        onMouseLeave={() => setHoverState("default")}
        onClick={() => onToggle(!value)}
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
          }}
          id={labelId}
        >
          {label}
        </span>
      )}
    </div>
  );
}
