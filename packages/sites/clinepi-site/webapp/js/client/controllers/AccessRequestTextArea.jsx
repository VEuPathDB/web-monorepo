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
      <br />
      <strong>
        <label
          style={{ marginBottom: '0', paddingBottom: '0' }}
          htmlFor={mykey}
        >
          {label}
        </label>
      </strong>
      <p style={{ fontSize: '14px', fontStyle: 'italic' }}>
        (Note: Max 4000 character limit.)
      </p>
      <textarea
        id={mykey}
        className={
          otherProps.disabled ? 'disabled-access-request-textarea' : null
        }
        rows={8}
        cols={150}
        maxLength={4000}
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
