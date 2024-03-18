/**
 * Provides a simple wrapper around <input type="file"/>.  The only difference
 * is that the value passed to the onChange property is the new file inside the
 * field, not the event causing the change.
 */

import { Omit } from '../../Core/CommonTypes';
import { wrappable } from '../../Utils/ComponentUtils';
import { bytesToHuman } from '../../Utils/Converters';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type InputWithoutOnChange = Omit<InputProps, 'onChange'>;
type Props = InputWithoutOnChange & {
  onChange: (value: File | null) => void;
  maxSizeBytes?: number;
};

const FileInput = function (originalProps: Props) {
  const { onChange, maxSizeBytes, ...props } = originalProps;
  const changeHandler = function (
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const file = event.target.files?.[0];
    if (file && maxSizeBytes && file.size > maxSizeBytes) {
      alert(
        `The file is too large. It must be no larger than ${bytesToHuman(
          maxSizeBytes
        )}.`
      );
      event.target.value = '';
    } else {
      onChange(event.target.files && event.target.files[0]);
    }
  };
  return <input type="file" {...props} onChange={changeHandler} />;
};

export default wrappable(FileInput);
