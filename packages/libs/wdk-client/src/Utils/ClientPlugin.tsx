import React from 'react';

export interface PluginEntryContext {
  type: string;
  name?: string;
  recordClassName?: string;
  questionName?: string;
}

type CompositePluginComponentProps<PluginProps> = {
  context: PluginEntryContext;
  pluginProps: PluginProps;
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
  type: string;
  name?: string;
  recordClassName?: string;
  questionName?: string;
  component: PluginComponent<PluginProps>;
}

export function makeCompositePluginComponent<T>(registry: ClientPluginRegistryEntry<T>[]): React.ComponentType<CompositePluginComponentProps<T>> {
  // TODO sort entries by specificity
  return function CompositePluginComponent(props: CompositePluginComponentProps<T>) {
    const entry = registry.find(entry => isMatchingEntry(entry, props.context));
    const PluginComponent = entry ? entry.component : DefaultPluginComponent;
    return <PluginComponent {...props.context} {...props.pluginProps}/>
  };
}

function isMatchingEntry<T>(entry: ClientPluginRegistryEntry<T>, context: PluginEntryContext): boolean {
  if (entry.type !== context.type) return false;
  if (entry.name && entry.name !== context.name) return false;
  if (entry.recordClassName && context.recordClassName && entry.recordClassName !== context.recordClassName) return false;
  if (entry.questionName && context.questionName && entry.questionName !== context.questionName) return false;
  return true;
}

// Default implementations
function DefaultPluginComponent() {
  return null;
}

export const PluginContext = React.createContext<CompositePluginComponent<any>>(makeCompositePluginComponent([]));

export function Plugin<PluginProps>(props: { context: PluginEntryContext, pluginProps: PluginProps }) {
  return (
    <PluginContext.Consumer>
      {PluginComponent => {
        return <PluginComponent {...props}/>
      }}
    </PluginContext.Consumer>
  );
}

