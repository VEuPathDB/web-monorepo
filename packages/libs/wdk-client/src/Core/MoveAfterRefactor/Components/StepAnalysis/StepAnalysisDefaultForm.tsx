import React, { Fragment, ReactNode } from 'react';
import { ParamComponent } from '../../../../Views/Question/Params';
import { join, mapValues, split } from 'lodash/fp';
import { HelpIcon } from '../../../../Components';
import { Parameter } from 'wdk-client/Utils/WdkModel';

interface StepAnalysisDefaultFormProps {
  paramSpecs: Parameter[];
  paramValues: Record<string, string>;
  updateParamValues: (newParamValues: Record<string, string>) => void;
  onFormSubmit: () => void;
}

export const StepAnalysisDefaultForm: React.FunctionComponent<StepAnalysisDefaultFormProps> = ({
  paramSpecs,
  paramValues,
  updateParamValues,
  onFormSubmit
}) => (
  <table style={tableStyle}>
    <tbody>
      {
        paramSpecs
          .filter(paramSpec => paramSpec.isVisible)
          .map(paramSpec =>
            <StepAnalysisParamRow
              key={paramSpec.name}
              displayName={<ParamDisplayName paramSpec={paramSpec} />}
              paramValues={paramValues}
              paramSpec={paramSpec}
              onChange={value => {
                updateParamValues({
                  ...paramValues,
                  [paramSpec.name]: value
                });
              }}
            />
          )
      }
      <tr>
        <td colSpan={2} style={submitTdStyle}>
          <input onClick={onFormSubmit} type="submit" value="Submit" />
        </td>
      </tr>
    </tbody>
  </table>
)

interface StepAnalysisRowProps {
  displayName: ReactNode;
  paramValues: Record<string, string>;
  paramSpec: Parameter;
  onChange: (newValue: string) => void;
}

const StepAnalysisParamRow: React.FunctionComponent<StepAnalysisRowProps> = ({
  displayName,
  paramValues,
  paramSpec,
  onChange
}) =>
  <tr>
    <td style={fieldTdStyle}>
      <label>
        <span style={labelSpanStyle}>{displayName}</span>
        {
          paramSpec.help &&
          <HelpIcon tooltipPosition={tooltipPosition}>{paramSpec.help}</HelpIcon>
        }
      </label>
    </td>
    <td>
      <ParamComponent
        key={paramSpec.name}
        ctx={{
          searchName: '',
          parameter: paramSpec,
          paramValues
        }}
        parameter={paramSpec}
        value={paramValues[paramSpec.name]}
        uiState={uiState}
        dispatch={NOOP}
        onParamValueChange={onChange}
      />
      {
        paramSpec.type === 'number' &&
        <span style={numberParamRangeSpanStyle}>
          ({paramSpec.min} - {paramSpec.max})
        </span>
      }
    </td>
  </tr>

interface ParamDisplayNameProps {
  paramSpec: Parameter;
}

const ParamDisplayName: React.SFC<ParamDisplayNameProps> = ({
  paramSpec
}) => (
  <>
    {paramSpec.displayName}
  </>
);

const uiState = {};
const NOOP = () => {};

const tooltipPosition = {
  my: 'top center',
  at: 'bottom center'
};

const tableStyle: React.CSSProperties = {
  margin: '0px auto'
};

const fieldTdStyle: React.CSSProperties = {
  textAlign: 'left',
  verticalAlign: 'top'
};

const labelSpanStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '4px',
  fontWeight: 'bold',
  paddingRight: '.5em'
};

const submitTdStyle: React.CSSProperties = {
  textAlign: 'center'
};

const numberParamRangeSpanStyle: React.CSSProperties = {
  color: 'gray',
  marginLeft: '0.5em'
};
