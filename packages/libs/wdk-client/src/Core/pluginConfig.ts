import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';
import DefaultQuestionForm from 'wdk-client/Views/Question/DefaultQuestionForm';
import ParameterComponent from 'wdk-client/Views/Question/ParameterComponent';
import DefaultQuestionController from 'wdk-client/Controllers/QuestionController';

// Default set of plugins provided by wdk
// FIXME Make this typesafe by enumerating
const pluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionController',
    component: DefaultQuestionController
  },
  {
    type: 'questionForm',
    component: DefaultQuestionForm
  },
  {
    type: 'questionFormParameter',
    component: ParameterComponent
  }
];

export default pluginConfig;
