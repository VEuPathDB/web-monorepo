import React from "react";
import { FieldLabel } from "./FieldLabel";
import { SingleSelect } from "@veupathdb/wdk-client/lib/Components";
import { FormValidator } from "./component-utils";

interface StudyDesignProps {
  readonly requireDesign: boolean;

  readonly designTerms: readonly string[];

  readonly designValue: string | undefined;

  onChangeDesign(value: string): void;

  readonly typeValue: string | undefined;

  onChangeType(value: string): void;

  fetchTypeTerms(design: string): string[];
}

const expandTerm = (term: string) => ({ display: term, value: term });

function validateStudyDesignType(props: StudyDesignProps): FormValidator {
  return () => {
    if (props.requireDesign && !props.designValue)
      return !props.typeValue
        ? [ "Required: study design", "Required: study type" ]
        : [ "Required: study design" ];

    if (props.designValue && !props.typeValue)
      return [ "Required: study type" ];

    return null;
  };
}

export function useStudyDesignSegment(props: StudyDesignProps): [ React.Factory<undefined>, FormValidator ] {
  return [ () => StudyDesignSection(props), validateStudyDesignType(props) ];
}

export function StudyDesignSection(props: StudyDesignProps): React.ReactElement {
  const { designValue, fetchTypeTerms } = props;
  const typeTerms = React.useMemo(
    () => designValue ? fetchTypeTerms(designValue) : [],
    [ designValue, fetchTypeTerms ],
  );

  return <div>
    <FieldLabel>Study design</FieldLabel>
    <SingleSelect
      items={props.designTerms.map(expandTerm)}
      value={designValue}
      onChange={props.onChangeDesign}
    />
    {
      typeTerms
        ? <>
          <FieldLabel>Study type</FieldLabel>
          <SingleSelect
            items={typeTerms.map(expandTerm)}
            value={props.typeValue}
            onChange={props.onChangeType}
          />
        </>
        : <></>
    }
  </div>;
}
