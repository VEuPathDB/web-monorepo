import React from 'react';
const AccessRequestTextArea = ({
  mykey,
  label,
  rows,
  cols,
  required,
  disabled,
  ...otherProps
}) => (
  <tr>
    <td colSpan={4}>
      <strong>
        <label htmlFor={mykey}>{label}</label>
      </strong>
      <br />
      <br />
      <textarea
        id={mykey}
        className={disabled ? 'disabled-access-request-textarea' : null}
        rows={8}
        cols={150}
        title={disabled ? 'Pending requests cannot be edited.' : null}
        disabled
        required
        {...otherProps}
      />
      <br />
      <br />
    </td>
  </tr>
);

export default AccessRequestTextArea;
