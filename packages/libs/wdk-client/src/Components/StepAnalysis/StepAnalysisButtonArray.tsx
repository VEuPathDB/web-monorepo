import React, { ReactNode } from 'react';

interface StepAnalysisButtonArrayProps {
  configs: StepAnalysisButtonConfig[];
}

export const StepAnalysisButtonArray: React.FC<StepAnalysisButtonArrayProps> =
  ({ configs }) => (
    <div
      style={{
        textAlign: 'right',
        display: 'block',
        float: 'right',
        paddingTop: '35px',
      }}
    >
      {configs.map((config) => (
        <StepAnalysisButton {...config} />
      ))}
    </div>
  );

type StepAnalysisButtonConfig = StepAnalysisButtonProps & { key: string };

interface StepAnalysisButtonProps {
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  customButton?: ReactNode;
  href?: string;
  iconClassName?: string;
  contents?: ReactNode;
}

const StepAnalysisButton: React.FC<StepAnalysisButtonProps> = ({
  onClick,
  customButton,
  href,
  iconClassName,
  contents,
}) => (
  <div style={{ display: 'inline-block', margin: '5px' }}>
    {customButton || (
      <a href={href} onClick={onClick}>
        <button className="btn" style={{ fontSize: '12px' }}>
          <i
            className={iconClassName}
            style={{ marginLeft: 0, paddingLeft: 0 }}
          >
            {' '}
          </i>
          {contents}
        </button>
      </a>
    )}
  </div>
);
