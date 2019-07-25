import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';
import DefaultQuestionForm from 'wdk-client/Views/Question/DefaultQuestionForm';
import ParameterComponent from 'wdk-client/Views/Question/ParameterComponent';
import { ByGenotypeNumberCheckbox } from 'wdk-client/Views/Question/Params/ByGenotypeNumberCheckbox/ByGenotypeNumberCheckbox'
import { ByGenotypeNumber } from 'wdk-client/Views/Question/Forms/ByGenotypeNumber/ByGenotypeNumber';
import { RadioParams } from 'wdk-client/Views/Question/Forms/RadioParams/RadioParams';
import { InternalGeneDataset } from 'wdk-client/Views/Question/Forms/InternalGeneDataset/InternalGeneDataset';
import { ByLocation } from 'wdk-client/Views/Question/Forms/ByLocation/ByLocation';
import DefaultQuestionController from 'wdk-client/Controllers/QuestionController';
import { CombineStepForm } from 'wdk-client/Views/Strategy/CombineStepForm';
import { CombineWithStrategyForm } from 'wdk-client/Views/Strategy/CombineWithStrategyForm';
import { CombineStepMenu } from 'wdk-client/Views/Strategy/CombineStepMenu';
import { ConvertStepMenu } from 'wdk-client/Views/Strategy/ConvertStepMenu';
import { ConvertStepForm } from 'wdk-client/Views/Strategy/ConvertStepForm';

// Default set of plugins provided by wdk
// FIXME Make this typesafe by enumerating
// TODO Move the custom question pages/parameters to the registries for Ebrc and/or Api
const pluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionController',
    test: ({ question }) => !!(
      question && 
      question.properties && 
      question.properties.datasetCategory &&
      question.properties.datasetSubtype
    ),    
    component: InternalGeneDataset
  },
  {
    type: 'questionController',
    component: DefaultQuestionController
  },
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
      question.urlSegment.endsWith('ByLocation')
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
  },
  {
    type: 'addStepOperationMenu',
    name: 'combine',
    component: CombineStepMenu
  },
  {
    type: 'addStepOperationMenu',
    name: 'convert',
    component: ConvertStepMenu
  },
  {
    type: 'addStepOperationForm',
    name: 'combine-with-search',
    component: CombineStepForm
  },
  {
    type: 'addStepOperationForm',
    name: 'combine-with-strategy',
    component: CombineWithStrategyForm
  },
  {
    type: 'addStepOperationForm',
    name: 'convert',
    component: ConvertStepForm
  }
];

export default pluginConfig;
