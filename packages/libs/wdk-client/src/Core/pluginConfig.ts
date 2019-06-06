import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';
import DefaultQuestionForm from 'wdk-client/Views/Question/DefaultQuestionForm';
import ParameterComponent from 'wdk-client/Views/Question/ParameterComponent';
import { ByGenotypeNumberCheckbox } from 'wdk-client/Views/Question/Params/ByGenotypeNumberCheckbox/ByGenotypeNumberCheckbox'
import { ByGenotypeNumber } from 'wdk-client/Views/Question/Forms/ByGenotypeNumber/ByGenotypeNumber';
import { RadioParams } from 'wdk-client/Views/Question/Forms/RadioParams/RadioParams';
import { InternalGeneDataset } from 'wdk-client/Views/Question/Forms/InternalGeneDataset/InternalGeneDataset';
import { ByLocation } from 'wdk-client/Views/Question/Forms/ByLocation/ByLocation';

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
    test: ({ question }) => !!(
      question && 
      question.properties && 
      question.properties['radio-params']
    ),
    component: RadioParams
  },
  {
    type: 'questionForm',
    test: ({ question }) => !!(
      question && 
      question.properties && 
      question.properties.datasetCategory &&
      question.properties.datasetSubtype
    ),
    component: InternalGeneDataset
  },
  {
    type: 'questionForm',
    test: ({ question }) => !!(
      question && 
      /ByLocation$/.exec(question.urlSegment)
    ),
    component: ByLocation
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
