import React from 'react';
import { AttributeField, RecordClass, Question } from '../../Utils/WdkModel';
import AttributeAnalysisButton from '../../Views/AttributeAnalysis/AttributeAnalysisButton';
import { Plugin, PluginEntryContext } from '../../Utils/ClientPlugin';
import {
  OpenAttributeAnalysis,
  CloseAttributeAnalysis,
} from '../../Views/ResultTableSummaryView/Types';
import { ResultType } from '../../Utils/WdkResult';

interface Props {
  activeAttributeAnalysisName: string | undefined;
  attribute: AttributeField;
  recordClass: RecordClass;
  question: Question;
  resultType: ResultType;
  headingComponents: {
    SortTrigger: React.ComponentType<any>;
    HelpTrigger: React.ComponentType<any>;
    ClickBoundary: React.ComponentType<any>;
  };
  removeAttribute: () => void;
  openAttributeAnalysis: OpenAttributeAnalysis;
  closeAttributeAnalysis: CloseAttributeAnalysis;
}

export default function AttributeHeading(props: Props) {
  const {
    activeAttributeAnalysisName,
    attribute,
    recordClass,
    question,
    resultType,
    headingComponents: { SortTrigger, HelpTrigger },
    removeAttribute,
    openAttributeAnalysis,
    closeAttributeAnalysis,
  } = props;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <SortTrigger />
      {attribute.displayName}
      <HelpTrigger />

      {attribute.isRemovable && (
        <div className="Trigger">
          <button
            type="button"
            title={`Remove ${attribute.displayName} from the table.`}
            className="wdk-Link RemoveColumnButton"
            onClick={(event) => {
              event.stopPropagation();
              removeAttribute();
            }}
          >
            <i className="fa fa-times-circle" />
          </button>
        </div>
      )}

      {attribute.formats.map((reporter) => {
        const context: PluginEntryContext = {
          type: 'attributeAnalysis',
          name: reporter.type,
          recordClassName: recordClass.urlSegment,
          searchName: question.urlSegment,
        };

        const pluginProps = {
          resultType,
          attributeName: attribute.name,
          reporterType: reporter.type,
        };

        return (
          <div className="Trigger" key={reporter.name}>
            <AttributeAnalysisButton
              resultType={resultType}
              reporter={reporter}
              isOpen={activeAttributeAnalysisName === reporter.name}
              onOpen={openAttributeAnalysis}
              onClose={closeAttributeAnalysis}
            >
              <Plugin context={context} pluginProps={pluginProps} />
            </AttributeAnalysisButton>
          </div>
        );
      })}
    </div>
  );
}
