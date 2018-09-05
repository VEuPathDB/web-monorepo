import observeParam from './FilterParamNew/ActionCreators';
import Component from './FilterParamNew/FilterParamNew';
import { reduce } from './FilterParamNew/State';
import { isParamValueValid, isType } from './FilterParamNew/Utils';
import { createParamModule } from './Utils';

export default createParamModule({
  isType,
  isParamValueValid,
  reduce,
  Component,
  observeParam
});
