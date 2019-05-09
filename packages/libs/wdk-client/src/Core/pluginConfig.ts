import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';
import DefaultQuestionForm from 'wdk-client/Views/Question/DefaultQuestionForm';
import ParameterComponent from 'wdk-client/Views/Question/ParameterComponent';
import { ByGenotypeNumberCheckbox } from 'wdk-client/Views/Question/Params/ByGenotypeNumberCheckbox/ByGenotypeNumberCheckbox'
import { ByGenotypeNumber } from 'wdk-client/Views/Question/Forms/ByGenotypeNumber/ByGenotypeNumber';

// TODO Once work on Mutually Exclusive Params is complete, 
// replace this with the appropriate custom search page
import { MutuallyExclusiveParams } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/MutuallyExclusiveParamsGroup';

// Default set of plugins provided by wdk
// FIXME Make this typesafe by enumerating
// TODO Move the custom pages/parameters to the registries for Ebrc and/or Api
const pluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionForm',
    searchName: 'ByGenotypeNumber',
    component: ByGenotypeNumber
  },
  {
    type: 'questionForm',
    searchName: 'SnpsByLocation',
    component: MutuallyExclusiveParams
  },
  {
    type: 'questionForm',
    searchName: 'NgsSnpsByLocation',
    component: MutuallyExclusiveParams
  },
  {
    type: 'questionForm',
    searchName: 'GenesByLocation',
    component: MutuallyExclusiveParams
  },
  {
    type: 'questionForm',
    component: DefaultQuestionForm
  },
  {
    type: 'questionFormParameter',
    name: 'genotype',
    searchName: 'ByGenotypeNumber',
    component: ByGenotypeNumberCheckbox
  },
  {
    type: 'questionFormParameter',
    component: ParameterComponent
  }
];

export default pluginConfig;
