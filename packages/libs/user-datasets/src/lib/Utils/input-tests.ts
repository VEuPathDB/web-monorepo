import {
  FileInputProps,
  TextAreaProps,
  TextInputProps,
} from '../Common/Forms/Components/LabelInputPair';
import * as util from './types';
import * as fn from './ergonomics';
import { isEmpty } from 'lodash';
import { isNonBlankString } from './value-tests';

export const testFileRequired = ({ value }: FileInputProps) =>
  value != null && value.length > 0;

export function newTextLengthTest(
  min: number,
  max: number
): util.Predicate<TextInputProps | TextAreaProps> {
  return ({ value, required, disabled }) => {
    return (
      disabled === true ||
      (!required && isEmpty(value)) ||
      fn.using(value?.length ?? 0, (it) => it >= min && it <= max)
    );
  };
}

export function testNonBlank({
  value,
  required,
  disabled,
}: TextInputProps | TextAreaProps): boolean {
  return (
    disabled === true ||
    (!required && !isEmpty(value)) ||
    isNonBlankString(value)
  );
}
