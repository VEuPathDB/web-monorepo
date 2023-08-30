import React from 'react';
const SupportFormField = ({ label, inputElement }) => (
  <tr className="field">
    <td>
      <b>{label}</b>
    </td>
    <td>{inputElement}</td>
  </tr>
);

export default SupportFormField;
