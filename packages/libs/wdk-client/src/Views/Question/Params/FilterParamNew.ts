import observeParam from 'wdk-client/Views/Question/Params/FilterParamNew/FilterParamObserver';
import Component from 'wdk-client/Views/Question/Params/FilterParamNew/FilterParamNew';
import { reduce } from 'wdk-client/Views/Question/Params/FilterParamNew/State';
import { isParamValueValid, isType } from 'wdk-client/Views/Question/Params/FilterParamNew/FilterParamUtils';
import { createParamModule } from 'wdk-client/Views/Question/Params/Utils';

export default createParamModule({
  isType,
  isParamValueValid,
  reduce,
  Component,
  observeParam
});
