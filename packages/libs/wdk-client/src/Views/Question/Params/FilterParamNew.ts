import observeParam from '../../../Views/Question/Params/FilterParamNew/FilterParamObserver';
import Component from '../../../Views/Question/Params/FilterParamNew/FilterParamNew';
import { reduce } from '../../../Views/Question/Params/FilterParamNew/State';
import {
  isParamValueValid,
  isType,
} from '../../../Views/Question/Params/FilterParamNew/FilterParamUtils';
import { createParamModule } from '../../../Views/Question/Params/Utils';

export default createParamModule({
  isType,
  isParamValueValid,
  reduce,
  Component,
  observeParam,
});
