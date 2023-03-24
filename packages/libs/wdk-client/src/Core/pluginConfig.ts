import { ClientPluginRegistryEntry } from '../Utils/ClientPlugin';
import DefaultQuestionForm from '../Views/Question/DefaultQuestionForm';
import ParameterComponent from '../Views/Question/ParameterComponent';
import DefaultQuestionController from '../Controllers/QuestionController';

// Default set of plugins provided by wdk
// FIXME Make this typesafe by enumerating
const pluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionController',
    component: DefaultQuestionController,
  },
  {
    type: 'questionForm',
    component: DefaultQuestionForm,
  },
  {
    type: 'questionFormParameter',
    component: ParameterComponent,
  },
];

export default pluginConfig;
