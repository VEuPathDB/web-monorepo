import React, { useContext } from 'react';
import { defaultMemoize } from 'reselect';
import LoadError from '../Components/PageStatus/LoadError';
import { WdkService } from '../Core';
import { useWdkService } from '../Hooks/WdkServiceHook';
import { Parameter, Question, RecordClass } from '../Utils/WdkModel';
import NotFound from '../Views/NotFound/NotFound';

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
  | 'stepDetails';

export interface PluginEntryContext {
  type: PluginType;
  name?: string;
  recordClassName?: string;
  searchName?: string;
  paramName?: string;
}

type CompositePluginComponentProps<PluginProps> = {
  context: PluginEntryContext;
  pluginProps: PluginProps;
  defaultComponent?: PluginComponent<PluginProps>;
  fallback?: React.ReactNode;
};

type ResolvedPluginReferences = {
  recordClass?: RecordClass;
  question?: Question;
  parameter?: Parameter;
};

type PluginComponent<PluginProps> = React.ComponentType<PluginProps>;

type CompositePluginComponent<PluginProps> = React.ComponentType<
  CompositePluginComponentProps<PluginProps>
>;

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

function makeCompositePluginComponentUncached<T>(
  registry: ClientPluginRegistryEntry<T>[]
): React.ComponentType<CompositePluginComponentProps<T>> {
  type Props = CompositePluginComponentProps<T>;

  function CompositePluginComponent(props: Props) {
    const resolvedReferences = useWdkService(
      async (wdkService) => {
        try {
          const { searchName, recordClassName, paramName } = props.context;
          const [{ parameter, question }, recordClass] = await Promise.all([
            resolveQuestionAndParameter(wdkService, searchName, paramName),
            recordClassName == null
              ? undefined
              : wdkService.findRecordClass(recordClassName),
          ]);
          return { parameter, question, recordClass };
        } catch (error) {
          return { error };
        }
      },
      [
        props.context.paramName,
        props.context.searchName,
        props.context.recordClassName,
      ]
    );

    if (resolvedReferences == null) return <>{props.fallback}</> ?? null;

    if ('error' in resolvedReferences) {
      return resolvedReferences.error.status === 404 ? (
        <NotFound />
      ) : (
        <LoadError />
      );
    }

    const defaultPluginComponent =
      props.defaultComponent || DefaultPluginComponent;
    const entry = registry.find((entry) =>
      isMatchingEntry(entry, props.context, resolvedReferences)
    );
    const PluginComponent = entry ? entry.component : defaultPluginComponent;
    return <PluginComponent {...props.context} {...props.pluginProps} />;
  }

  return CompositePluginComponent;
}

// We should only re-create the composite plugin component if the plugin registry has changed
export const makeCompositePluginComponent = defaultMemoize(
  makeCompositePluginComponentUncached
);

async function resolveQuestionAndParameter(
  wdkService: WdkService,
  searchName?: string,
  paramName?: string
) {
  if (searchName == null) {
    return {
      parameter: undefined,
      question: undefined,
    };
  }

  if (paramName === null) {
    return {
      parameter: undefined,
      question: await wdkService.findQuestion(searchName),
    };
  }

  const question = await wdkService.getQuestionAndParameters(searchName);
  const parameter = question?.parameters.find(({ name }) => name === paramName);

  return {
    parameter,
    question,
  };
}

function isMatchingEntry<T>(
  entry: ClientPluginRegistryEntry<T>,
  context: PluginEntryContext,
  references: ResolvedPluginReferences
): boolean {
  if (entry.type !== context.type) return false;
  if (entry.name && entry.name !== context.name) return false;
  if (
    entry.recordClassName &&
    context.recordClassName &&
    entry.recordClassName !== context.recordClassName
  )
    return false;
  if (
    entry.searchName &&
    context.searchName &&
    entry.searchName !== context.searchName
  )
    return false;
  if (entry.test) return entry.test(references);
  return true;
}

// Default implementations
function DefaultPluginComponent() {
  return null;
}

export const PluginContext = React.createContext<CompositePluginComponent<any>>(
  makeCompositePluginComponent([])
);

export function Plugin<PluginProps>(
  props: CompositePluginComponentProps<PluginProps>
) {
  const PluginComponent = useContext(PluginContext);

  return <PluginComponent {...props} />;
}
