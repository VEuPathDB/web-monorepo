import React from 'react';
const AccessRequestTextArea = ({
  mykey,
  label,
  rows,
  cols,
  required,
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
        className={
          otherProps.disabled ? 'disabled-access-request-textarea' : null
        }
        rows={8}
        cols={150}
        title={
          otherProps.disabled ? 'Pending requests cannot be edited.' : null
        }
        required
        {...otherProps}
      />
      <br />
      <br />
    </td>
  </tr>
);

export default AccessRequestTextArea;
