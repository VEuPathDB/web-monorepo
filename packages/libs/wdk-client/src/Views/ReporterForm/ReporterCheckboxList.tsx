import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import CheckboxList from '../../Components/InputControls/CheckboxList';
import { NamedModelEntity } from '../../Utils/WdkModel';

interface ReporterCheckboxListProps {
  title: string;
  onChange: (value: string[]) => void;
  fields: NamedModelEntity[];
  selectedFields: string[];
}

const ReporterCheckboxList: React.FC<ReporterCheckboxListProps> = (props) => {
  const { title, onChange, fields, selectedFields } = props;
  if (fields.length === 0) {
    return <noscript />;
  }
  const mappedFields = fields.map((val) => ({
    value: val.name,
    display: val.displayName,
  }));
  return (
    <div>
      <h3>{title}</h3>
      <div style={{ padding: '0 2em' }}>
        <CheckboxList
          onChange={onChange}
          items={mappedFields}
          value={selectedFields}
        />
      </div>
    </div>
  );
};

export default wrappable(ReporterCheckboxList);
