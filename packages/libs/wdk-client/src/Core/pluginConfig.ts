import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';
import DefaultQuestionForm from 'wdk-client/Views/Question/DefaultQuestionForm';
import ParameterComponent from 'wdk-client/Views/Question/ParameterComponent';
import { ByGenotypeNumberCheckbox } from 'wdk-client/Views/Question/Params/ByGenotypeNumberCheckbox/ByGenotypeNumberCheckbox'
import { ByGenotypeNumber } from 'wdk-client/Views/Question/Forms/ByGenotypeNumber/ByGenotypeNumber';

// Default set of plugins provided by wdk
// FIXME Make this typesafe by enumerating
const pluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionForm',
    searchName: 'ByGenotypeNumber',
    component: ByGenotypeNumber
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
