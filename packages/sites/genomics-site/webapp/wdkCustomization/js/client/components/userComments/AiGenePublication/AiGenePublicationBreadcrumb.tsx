import React from 'react';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';

export type AiFlowStep =
  | 'publication-source'
  | 'generating-comment'
  | 'review-publish';

interface AiGenePublicationBreadcrumbProps {
  activeStep: AiFlowStep;
}

const STEPS: { key: AiFlowStep; label: string }[] = [
  { key: 'publication-source', label: 'Publication source' },
  { key: 'generating-comment', label: 'Generating comment' },
  { key: 'review-publish', label: 'Review & publish' },
];

// Fallback maroon matching the mockup design; used when no UIThemeProvider
// supplies a primary colour (e.g. in isolated tests or unthemed contexts).
const FALLBACK_PRIMARY_COLOR = '#993333';
const MID_GREY = '#888888';
const FUTURE_OPACITY = 0.45;

type StepState = 'active' | 'completed' | 'future';

export function AiGenePublicationBreadcrumb({
  activeStep,
}: AiGenePublicationBreadcrumbProps) {
  const theme = useUITheme();

  // Resolve the site primary colour from the theme if available.
  // The genomics-site global theme sets primary to mutedBlue[600] (#336F99).
  // The mockup was designed with a maroon; a parent can override by wrapping
  // in a UIThemeProvider with a red/maroon primary if desired.
  const primaryColor: string = theme
    ? theme.palette.primary.hue[theme.palette.primary.level]
    : FALLBACK_PRIMARY_COLOR;

  const activeIndex = STEPS.findIndex((s) => s.key === activeStep);

  return (
    <nav
      aria-label="AI comment flow steps"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 0',
        fontFamily: 'inherit',
        fontSize: '14px',
      }}
    >
      {STEPS.map((step, index) => {
        const stepState: StepState =
          index < activeIndex
            ? 'completed'
            : index === activeIndex
            ? 'active'
            : 'future';

        const isActive = stepState === 'active';
        const isCompleted = stepState === 'completed';
        const isFuture = stepState === 'future';

        const circleColor = isActive
          ? primaryColor
          : isCompleted
          ? MID_GREY
          : MID_GREY;

        const containerStyle: React.CSSProperties = isFuture
          ? { opacity: FUTURE_OPACITY }
          : {};

        const circleStyle: React.CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: `2px solid ${circleColor}`,
          color: isActive ? primaryColor : MID_GREY,
          fontSize: '12px',
          fontWeight: isActive ? 700 : 400,
          flexShrink: 0,
          backgroundColor: 'transparent',
          boxSizing: 'border-box',
        };

        const labelStyle: React.CSSProperties = {
          fontWeight: isActive ? 700 : 400,
          color: 'inherit',
          whiteSpace: 'nowrap',
        };

        return (
          <React.Fragment key={step.key}>
            {index > 0 && (
              <span
                aria-hidden="true"
                style={{ color: MID_GREY, flexShrink: 0 }}
              >
                →
              </span>
            )}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                ...containerStyle,
              }}
            >
              <span style={circleStyle}>{index + 1}</span>
              <span style={labelStyle}>{step.label}</span>
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
