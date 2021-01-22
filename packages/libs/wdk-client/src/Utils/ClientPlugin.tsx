import React, { useContext } from 'react';
import { defaultMemoize } from 'reselect';
import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import { useSelector } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';

export type PluginType =
  | 'attributeAnalysis'
  | 'questionController'
  | 'questionForm'
  | 'questionFormParameter'
  | 'summaryView'
  | 'stepAnalysisView'
  | 'stepAnalysisForm'
  | 'stepAnalysisResult'
  | 'questionFilter'
  | 'stepBox'
  | 'stepDetails'

export interface PluginEntryContext {
  type: PluginType;
  name?: string;
  recordClassName?: string;
  searchName?: string;
}

type CompositePluginComponentProps<PluginProps> = {
  context: PluginEntryContext;
  pluginProps: PluginProps;
  defaultComponent?: PluginComponent<PluginProps>;
}

type ResolvedPluginReferences = {
  recordClass?: RecordClass;
  question?: Question;
}

type PluginComponent<PluginProps> = React.ComponentType<PluginProps>;

type CompositePluginComponent<PluginProps> = React.ComponentType<CompositePluginComponentProps<PluginProps>>;

/**
 * An entry for a ClientPlugin.
 *
 * @example
 * {
 *   type: 'attributeReporter',
 *   name: 'wordCloud',
 *   component: WordCloudPlugin
 * }
 *
 * @example
 * {
 *   type: 'attributeReporter',
 *   name: 'wordCloud',
 *   recordClassName: 'transcript',
 *   component: WordCloudTranscriptPlugin
 * }
 *
 * @example
 * {
 *   type: 'downloadForm',
 *   name: 'gff',
 *   recordClass: 'gene',
 *   component: GeneGffDownloadForm
 * }
 *
 * @example
 * {
 *   type: 'recordPageAttribute',
 *   name: 'gbrowse',
 *   recordClassName: 'gene',
 *   component: GbrowseGeneAttribute
 * }
 *
 */
export interface ClientPluginRegistryEntry<PluginProps> {
  type: PluginType;
  name?: string;
  recordClassName?: string;
  searchName?: string;
  // TODO Make recordClass required, and question optional, based on context (ie, if question is relevant, make it required)
  test?: (references: ResolvedPluginReferences) => boolean;
  component: PluginComponent<PluginProps>;
}

function makeCompositePluginComponentUncached<T>(registry: ClientPluginRegistryEntry<T>[]): React.ComponentType<CompositePluginComponentProps<T>> {

  type Props = CompositePluginComponentProps<T>;

  function CompositePluginComponent(props: Props) {
    const resolvedReferences = useSelector((state: RootState) => {
      const { questions, recordClasses } = state.globalData;
      if (questions == null || recordClasses == null) return null;
      try {
        const { searchName, recordClassName } = props.context;
        const question = questions.find(q => q.urlSegment === searchName);
        const recordClass = recordClasses.find(r => r.urlSegment === recordClassName);
        return { question, recordClass };
      }
      catch(error) {
        return { error };
      }
    })

    if (resolvedReferences == null) return null;

    if ('error' in resolvedReferences) {
      return resolvedReferences.error.status === 404
        ? <NotFound/>
        : <LoadError/>
    }

    const defaultPluginComponent = props.defaultComponent || DefaultPluginComponent;
    const entry = registry.find(entry => isMatchingEntry(entry, props.context, resolvedReferences));
    const PluginComponent = entry ? entry.component : defaultPluginComponent;
    return <PluginComponent {...props.context} {...props.pluginProps}/>
  }

  return CompositePluginComponent;
}

// We should only re-create the composite plugin component if the plugin registry has changed
export const makeCompositePluginComponent = defaultMemoize(makeCompositePluginComponentUncached);

function isMatchingEntry<T>(entry: ClientPluginRegistryEntry<T>, context: PluginEntryContext, references: ResolvedPluginReferences): boolean {
  if (entry.type !== context.type) return false;
  if (entry.name && entry.name !== context.name) return false;
  if (entry.recordClassName && context.recordClassName && entry.recordClassName !== context.recordClassName) return false;
  if (entry.searchName && context.searchName && entry.searchName !== context.searchName) return false;
  if (entry.test) return entry.test(references);
  return true;
}

function isResolved(context: PluginEntryContext, references: ResolvedPluginReferences) {
  const { searchName, recordClassName } = context;
  const { question, recordClass } = references;
  const isSearchResolved = searchName == null ? true : question != null;
  const isRecordClassResolved = recordClassName == null ? true : recordClass != null;
  return isSearchResolved && isRecordClassResolved;
}

// Default implementations
function DefaultPluginComponent() {
  return null;
}

export const PluginContext = React.createContext<CompositePluginComponent<any>>(makeCompositePluginComponent([]));

export function Plugin<PluginProps>(props: CompositePluginComponentProps<PluginProps>) {
  const PluginComponent = useContext(PluginContext);

  return <PluginComponent {...props}/>;
}
