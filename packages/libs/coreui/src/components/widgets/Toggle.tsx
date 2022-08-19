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
  disabled: ToggleStateStyleSpec;
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
  themeRole,
  state,
  onToggle,
  disabled,
  size = "medium",
}: ToggleProps) {
  const theme = useUITheme();
  const [toggleState, setToggleState] =
    useState<"default" | "hover">("default");

  const styleSpec: ToggleStyleSpec = useMemo(() => {
    const defaultStyleSpec: ToggleStyleSpec = {
      container: {},
      default: [
        {
          backgroundColor: blue[500],
          knobColor: "white",
          borderColor: undefined,
          labelColor: gray[600],
        },
      ],
      hover: [
        {
          backgroundColor: blue[600],
          knobColor: "white",
          borderColor: undefined,
          labelColor: gray[600],
        },
      ],
      disabled: {
        backgroundColor: gray[500],
        knobColor: "white",
        borderColor: undefined,
        labelColor: gray[600],
      },
    };

    const themeStyles: ToggleStyleSpecSubset | undefined = theme &&
      themeRole && {
        default: [
          {
            backgroundColor: theme?.palette[themeRole].hue[500],
            knobColor: theme?.palette[themeRole].hue[100],
          },
        ],
        hover: [
          {
            backgroundColor: theme?.palette[themeRole].hue[600],
            knobColor: theme?.palette[themeRole].hue[100],
          },
        ],
      };

    return merge({}, defaultStyleSpec, themeStyles, styleOverrides);
  }, [styleOverrides, theme, themeRole]);

  /**
   * The CSS styles that should be applied can depend
   * on (1) whether or not the component is
   * focused/hovered and (2) which option is selected.
   */
  const currentStyles = useMemo(() => {
    if (disabled) return styleSpec.disabled;

    const selectedOptionIndex = state ? 1 : 0;

    return styleSpec[toggleState][selectedOptionIndex]
      ? styleSpec[toggleState][selectedOptionIndex]
      : styleSpec[toggleState][0];
  }, [toggleState, state, styleSpec, disabled]);

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
        onFocus={() => setToggleState("hover")}
        onBlur={() => setToggleState("default")}
        onMouseEnter={() => setToggleState("hover")}
        onMouseLeave={() => setToggleState("default")}
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
