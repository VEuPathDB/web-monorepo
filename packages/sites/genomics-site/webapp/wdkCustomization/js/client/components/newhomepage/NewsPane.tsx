import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { combineClassNames } from './Utils';

const cx = makeClassNameHelper('ebrc-NewsPane');

type Props = {
  containerClassName?: string
};

export const NewsPane = ({ containerClassName }: Props) =>
  <aside className={combineClassNames(cx(), containerClassName)}>
    
  </aside>;
