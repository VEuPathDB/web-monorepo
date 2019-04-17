const AccessRequestTextArea = ({
  key,
  label,
  rows,
  cols,
  required,
  ...otherProps
}) => (
  <tr>
    <td colSpan={4}>
      <strong>
        <label htmlFor={key}>
          {label}
        </label>
      </strong>
      <br />
      <br />
      <textarea
        id={key}
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
