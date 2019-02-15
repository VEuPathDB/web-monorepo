import React from 'react';
import {
  AttributeField,
  RecordClass,
  Question
} from 'wdk-client/Utils/WdkModel';
import AttributeAnalysisButton from 'wdk-client/Views/AttributeAnalysis/AttributeAnalysisButton';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';

interface Props {
  activeAttributeAnalysisName: string | undefined;
  attribute: AttributeField;
  recordClass: RecordClass;
  question: Question;
  stepId: number;
  headingComponents: {
    SortTrigger: React.ComponentType<any>;
    HelpTrigger: React.ComponentType<any>;
    ClickBoundary: React.ComponentType<any>;
  };
  removeAttribute: () => void;
  openAttributeAnalysis: (reporterName: string, stepId: number) => void;
  closeAttributeAnalysis: (reporterName: string, stepId: number) => void;
}

export default function AttributeHeading(props: Props) {
  const {
    activeAttributeAnalysisName,
    attribute,
    recordClass,
    question,
    stepId,
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
            <i className="fa fa-times-circle"/>
          </button>
        </div>
      )}

      {attribute.formats.map(reporter => {
        const context = {
          type: 'attributeAnalysis',
          name: reporter.type,
          recordClassName: recordClass.name,
          questionName: question.name
        };

        const pluginProps = {
          stepId,
          attributeName: attribute.name,
          reporterType: reporter.type
        };

        return (
          <div className="Trigger" key={reporter.name}>
            <AttributeAnalysisButton
              stepId={stepId}
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
