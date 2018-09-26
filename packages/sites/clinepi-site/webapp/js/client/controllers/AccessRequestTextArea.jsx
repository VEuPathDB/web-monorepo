const AccessRequestTextArea = ({
  label,
  rows,
  cols,
  required,
  ...otherProps
}) => (
  <tr>
    <td colSpan={4}>
      <strong>
        <label htmlFor={label}>
          {label}
        </label>
      </strong>
      <br />
      <br />
      <textarea
        id={label}
        rows={8}
        cols={150}
        required
        {...otherProps}
      />
      <br />
      <br />
    </td>
  </tr>
);

export default AccessRequestTextArea;
