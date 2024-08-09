import React from 'react';
import {
  RadioList,
  TextBox,
  HelpIcon,
} from '@veupathdb/wdk-client/lib/Components';
import { FormRow } from './FormRow';

interface LocationFieldProps {
  coordinateTypeField: string;
  rangesField: string;
  onCoordinateTypeChange: (newValue: string) => void;
  onRangesChange: (newValue: string) => void;
}

export const LocationField: React.FunctionComponent<LocationFieldProps> = ({
  coordinateTypeField,
  rangesField,
  onCoordinateTypeChange,
  onRangesChange,
}) => (
  <div className="wdk-LocationField">
    <FormRow
      label="Strand:"
      field={
        <RadioList
          items={[
            {
              display: 'Forward',
              value: 'genomef',
            },
            {
              display: 'Reverse',
              value: 'genomer',
            },
          ]}
          onChange={onCoordinateTypeChange}
          value={coordinateTypeField}
        />
      }
    />
    <FormRow
      label="Genome Coordinates:"
      field={
        <>
          <TextBox onChange={onRangesChange} value={rangesField} />
          <HelpIcon>
            <ul>
              <li>Leave blank if Location is not applicable</li>
              <li>Example 1: 1000-2000</li>
              <li>Example 2: 1000-2000, 2500-2600, 3000-5000</li>
              <li>Always use the forward strand (5\'-3\') coordinates</li>
            </ul>
          </HelpIcon>
        </>
      }
    />
  </div>
);
