import { ClientPluginRegistryEntry } from '../Utils/ClientPlugin';
import DefaultQuestionForm from '../Views/Question/DefaultQuestionForm';
import ParameterComponent from '../Views/Question/ParameterComponent';
import DefaultQuestionController from '../Controllers/QuestionController';

/**
 * WDK Base Plugin Configuration
 *
 * This file provides the default plugin implementations for the WDK client.
 * These plugins serve as fallbacks when no more specific plugins are defined
 * in higher-level configurations (EBRC or site-specific).
 *
 * For comprehensive documentation on the plugin system, see:
 * - Plugin System Architecture: ../Utils/PLUGIN_SYSTEM.md
 *
 * Plugin Hierarchy:
 * 1. Site-specific plugins (highest precedence) - e.g., genomics-site/pluginConfig.tsx
 * 2. EBRC shared plugins (medium precedence) - web-common/pluginConfig.ts
 * 3. WDK base plugins (lowest precedence) - THIS FILE
 *
 * The plugins in this file provide:
 * - DefaultQuestionController: Base question form behavior
 * - DefaultQuestionForm: Base question form UI
 * - ParameterComponent: Base parameter input components
 */

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
