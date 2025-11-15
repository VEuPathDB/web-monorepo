import React from 'react';

interface Props {
  label: string;
  inputElement: React.ReactNode;
}

const SupportFormField: React.FC<Props> = ({ label, inputElement }) => (
  <tr className="field">
    <td>
      <b>{label}</b>
    </td>
    <td>{inputElement}</td>
  </tr>
);

export default SupportFormField;
