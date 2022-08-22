import { CSSProperties } from "react";
import { Subset } from "../../definitions/types";

import { ThemeRole } from "../theming/types";
import { useMemo, useState } from "react";

// Definitions
import { primaryFont } from "../../styleDefinitions/typography";
import { blue } from "@material-ui/core/colors";
import { gray } from "../../definitions/colors";
import { useUITheme } from "../theming";
import { merge } from "lodash";

// Type definitions for working with styles.
type ToggleStateStyleSpec = {
  backgroundColor: CSSProperties["color"];
  labelColor: CSSProperties["color"];
  knobColor: CSSProperties["color"];
  borderColor: CSSProperties["color"];
};

type ToggleStyleSpec = {
  container: React.CSSProperties;
  default: ToggleStateStyleSpec[];
  hover: ToggleStateStyleSpec[];
  disabled: ToggleStateStyleSpec[];
};

type ToggleStyleSpecSubset = Subset<ToggleStyleSpec>;

// Prop definitions.
export type ToggleProps = {
  /** Currently selected option. */
  state: boolean;
  /** Callback to invoke when the toggle is flipped. */
  onToggle: (state: boolean) => void;
  /** Text to render beside the toggle. Optional. */
  label?: string;
  /** Position of label. Optional, defaults to left. */
  labelPosition?: "left" | "right";
  /** Specification on how toggle should be styled. */
  styleOverrides: ToggleStyleSpecSubset;
  /** Primary or secondary. */
  themeRole?: ThemeRole;
  /** Whether the component is currently disabled for user interactions. */
  disabled?: boolean;
  /** Size of toggle. Optional, defaults to medium. */
  size?: "medium" | "small";
};

/** Fully controlled Toggle component. */
export default function Toggle({
  label,
  labelPosition,
  styleOverrides,
  themeRole = "primary",
  state,
  onToggle,
  disabled,
  size = "medium",
}: ToggleProps) {
  const theme = useUITheme();
  const [hoverState, setHoverState] = useState<"default" | "hover">("default");

  const styleSpec: ToggleStyleSpec = useMemo(() => {
    const defaultStyleSpec: ToggleStyleSpec = {
      container: {},
      default: [
        {
          backgroundColor: "none",
          knobColor: blue[400],
          borderColor: blue[400],
          labelColor: gray[600],
        },
        {
          backgroundColor: blue[400],
          knobColor: "white",
          borderColor: blue[400],
          labelColor: gray[600],
        },
      ],
      hover: [
        {
          backgroundColor: blue[100],
          knobColor: blue[400],
          borderColor: blue[400],
          labelColor: gray[600],
        },
        {
          backgroundColor: blue[500],
          knobColor: "white",
          borderColor: blue[500],
          labelColor: gray[600],
        },
      ],
      disabled: [
        {
          backgroundColor: "none",
          knobColor: gray[300],
          borderColor: gray[300],
          labelColor: gray[600],
        },
        {
          backgroundColor: gray[300],
          knobColor: "white",
          borderColor: gray[300],
          labelColor: gray[600],
        },
      ],
    };

    const themeStyles: ToggleStyleSpecSubset | undefined = theme && {
      default: [
        {
          knobColor: theme.palette[themeRole].hue[400],
          borderColor: theme.palette[themeRole].hue[400],
        },
        {
          backgroundColor: theme.palette[themeRole].hue[400],
          borderColor: theme.palette[themeRole].hue[400],
        },
      ],
      hover: [
        {
          backgroundColor: theme.palette[themeRole].hue[100],
          knobColor: theme.palette[themeRole].hue[400],
          borderColor: theme.palette[themeRole].hue[400],
        },
        {
          backgroundColor: theme.palette[themeRole].hue[500],
          borderColor: theme.palette[themeRole].hue[500],
        },
      ],
    };

    return merge({}, defaultStyleSpec, themeStyles, styleOverrides);
  }, [styleOverrides, theme, themeRole]);

  /**
   * The CSS styles that should be applied can depend
   * on (1) whether or not the component is
   * focused/hovered, (2) which option is selected,
   * and (3) whether the toggle is disabled.
   */
  const currentStyles = useMemo(() => {
    const selectedOptionIndex = state ? 1 : 0;

    return disabled
      ? styleSpec.disabled[selectedOptionIndex]
      : styleSpec[hoverState][selectedOptionIndex]
      ? styleSpec[hoverState][selectedOptionIndex]
      : styleSpec[hoverState][0];
  }, [hoverState, state, styleSpec, disabled]);

  const ariaLabel = useMemo(() => {
    if (label) return label + " Toggle";
    else return "Toggle";
  }, [label]);

  const width = size === "medium" ? 40 : 20;
  const height = width / 2;
  const knobSize = height / 2;

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
        >
          {label}
        </span>
      )}
      <div
        role="switch"
        aria-label={ariaLabel}
        aria-checked={state}
        css={{
          display: "flex",
          transition: "all ease .33s",
          alignItems: "center",
          width,
          height,
          borderRadius: height / 4,
          backgroundColor: currentStyles.backgroundColor,
          ...(currentStyles.borderColor
            ? {
                outlineColor: currentStyles.borderColor,
                outlineWidth: 2,
                outlineStyle: "solid",
                outlineOffset: -2,
              }
            : {
                outline: "none",
              }),
        }}
        onKeyDown={(event) => {
          if (["Space", "Enter"].includes(event.code)) {
            onToggle(!state);
          }
        }}
        onFocus={() => setHoverState("hover")}
        onBlur={() => setHoverState("default")}
        onMouseEnter={() => setHoverState("hover")}
        onMouseLeave={() => setHoverState("default")}
        onClick={() => onToggle(!state)}
        tabIndex={0}
      >
        <div
          css={{
            position: "relative",
            width: knobSize,
            height: knobSize,
            borderRadius: 10,
            left: !state ? width / 5 : width - knobSize - width / 5,
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
        >
          {label}
        </span>
      )}
    </div>
  );
}
