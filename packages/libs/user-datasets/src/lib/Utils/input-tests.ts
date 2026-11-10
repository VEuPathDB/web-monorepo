import {
  FileInputProps,
  TextAreaProps,
  TextInputProps,
} from '../Common/Forms/Components/LabelInputPair';
import * as util from './types';
import * as fn from './ergonomics';
import { isEmpty } from 'lodash';
import { isNonBlankString } from './value-tests';

type TextProps = TextInputProps | TextAreaProps;

export const testFileRequired = ({ value }: FileInputProps) =>
  value != null && value.length > 0;

export const newTextLengthTest = (min: number, max: number): util.Predicate<TextProps> =>
  ({ value, required, disabled }) =>
    disabled === true
      || (!required && isEmpty(value))
      || fn.using(value?.length ?? 0, (it) => it >= min && it <= max);

export const testNonBlank = ({
  value,
  required,
  disabled,
}: TextProps) =>
  disabled === true
    || (!required && !isEmpty(value))
    || isNonBlankString(value);
