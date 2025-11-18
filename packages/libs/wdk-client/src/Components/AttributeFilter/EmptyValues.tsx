import React from 'react';

import Icon from '../../Components/Icon/IconAlt';

import { isRange } from '../../Components/AttributeFilter/AttributeFilterUtils';
import { Field } from '../../Components/AttributeFilter/Types';

interface EmptyValueProps {
  activeField: Field;
}

export default function EmptyValue(props: EmptyValueProps) {
  return (
    <div style={{ fontSize: '5rem', textAlign: 'center', margin: '5rem' }}>
      <Icon fa={isRange(props.activeField) ? 'bar-chart-o' : 'table'} />
      <div style={{ fontSize: '1.5rem', margin: '1rem' }}>No data</div>
    </div>
  );
}
