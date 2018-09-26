const AccessRequestTextField = ({
  label,
  value
}) => (
  <tr>
    <td>
      <strong>{label}</strong>
    </td>
    <td>
      {value}
    </td>
    <td colSpan={2}>
      <br />
      <br />
    </td>
  </tr>
);

export default AccessRequestTextField;
