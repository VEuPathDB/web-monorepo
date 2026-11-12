import {
  FileInputProps,
  TextAreaProps,
  TextInputProps,
} from '../Common/Forms/Components/LabelInputPair';
import * as util from './types';
import * as fn from './ergonomics';
import { isEmpty } from 'lodash';
import { isNonBlankString } from './value-tests';
import React from 'react';

type TextProps = TextInputProps | TextAreaProps;

export const testFileRequired = ({ value }: FileInputProps) =>
  value != null && value.length > 0;

/**
 * @deprecated
 */
export const newTextLengthTest = (min: number, max: number): util.Predicate<TextProps> =>
  ({ value, required, disabled }) =>
    disabled === true
      || (!required && isEmpty(value))
      || fn.using(value?.length ?? 0, (it) => it >= min && it <= max);

export function useTextLengthTest(min: number, max: number): util.Predicate<TextProps> {
  return React.useCallback(
    ({ value, required, disabled }) =>
      disabled === true
      || (!required && isEmpty(value))
      || fn.using(value?.length ?? 0, (it) => it >= min && it <= max),
    [min, max],
  );
}

export const testNonBlank = ({
  value,
  required,
  disabled,
}: TextProps) =>
  disabled === true
    || (!required && !isEmpty(value))
    || isNonBlankString(value);
