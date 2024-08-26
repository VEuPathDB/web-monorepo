import React, { ReactNode } from 'react';
import { ParamComponent } from '../../Views/Question/Params';
import { HelpIcon } from '../../Components';
import { Parameter } from '../../Utils/WdkModel';
import { StepAnalysisFormPluginProps } from './StepAnalysisFormPane';

export const StepAnalysisDefaultForm: React.FunctionComponent<StepAnalysisFormPluginProps> =
  ({ formKey, paramSpecs, paramValues, updateParamValues, onFormSubmit }) => (
    <table style={tableStyle}>
      <tbody>
        {paramSpecs
          .filter((paramSpec) => paramSpec.isVisible)
          .map((paramSpec) => (
            <StepAnalysisParamRow
              key={paramSpec.name}
              formKey={formKey}
              displayName={<ParamDisplayName paramSpec={paramSpec} />}
              paramValues={paramValues}
              paramSpec={paramSpec}
              onChange={(value) => {
                updateParamValues({
                  ...paramValues,
                  [paramSpec.name]: value,
                });
              }}
            />
          ))}
        <tr>
          <td colSpan={2} style={submitTdStyle}>
            <input onClick={onFormSubmit} type="submit" value="Submit" />
          </td>
        </tr>
      </tbody>
    </table>
  );

interface StepAnalysisRowProps {
  formKey: string;
  displayName: ReactNode;
  paramValues: Record<string, string>;
  paramSpec: Parameter;
  onChange: (newValue: string) => void;
}

const StepAnalysisParamRow: React.FunctionComponent<StepAnalysisRowProps> = ({
  formKey,
  displayName,
  paramValues,
  paramSpec,
  onChange,
}) => (
  <tr>
    <td style={fieldTdStyle}>
      <label>
        <span style={labelSpanStyle}>{displayName}</span>
        {paramSpec.help && <HelpIcon>{paramSpec.help}</HelpIcon>}
      </label>
    </td>
    <td>
      <ParamComponent
        ctx={{
          searchName: formKey,
          parameter: paramSpec,
          paramValues,
        }}
        parameter={paramSpec}
        value={paramValues[paramSpec.name]}
        uiState={uiState}
        dispatch={NOOP}
        onParamValueChange={onChange}
      />
      {paramSpec.type === 'number' && (
        <span style={numberParamRangeSpanStyle}>
          ({paramSpec.min} - {paramSpec.max})
        </span>
      )}
    </td>
  </tr>
);

interface ParamDisplayNameProps {
  paramSpec: Parameter;
}

const ParamDisplayName: React.FC<ParamDisplayNameProps> = ({ paramSpec }) => (
  <>{paramSpec.displayName}</>
);

const uiState = {};
const NOOP = () => {};

const tableStyle: React.CSSProperties = {
  margin: '0px auto',
};

const fieldTdStyle: React.CSSProperties = {
  textAlign: 'left',
  verticalAlign: 'top',
};

const labelSpanStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '4px',
  fontWeight: 'bold',
  paddingRight: '.5em',
};

const submitTdStyle: React.CSSProperties = {
  textAlign: 'center',
};

const numberParamRangeSpanStyle: React.CSSProperties = {
  color: 'gray',
  marginLeft: '0.5em',
};
