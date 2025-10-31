import React, { JSXElementConstructor, ReactElement } from "react";
import { DatasetCharacteristics } from "../../Service/Types";
import { LabeledTextInput, LabeledTextListInput } from "./LabeledInput";
import { FieldLabel } from "./FieldLabel";
import { FormValidation } from "../UploadForm";
import { DatasetFormData } from "../FormTypes";
import { FieldSetter } from "../../Utils/util-types";

const idPrefix = "dataset-characteristics";


function validateYears(start: number | undefined, end: number | undefined): string[] | null {
  if (start !== undefined) {
    if (start < 1000 || start > 9999)
      return [ "Start year must be 4 digits" ];

    if (typeof end !== "number") {
      if (!end)
        return [ "End year is required" ];

      return [ "End year must be a number" ];
    }

    if (end < start)
      return [ "End year cannot be before start year" ];

    if (end > 9999)
      return [ "End year must be 4 digits" ];

  } else if (end !== undefined) {
    return [ "Start year is required" ];
  }

  return null;
}

function validateStudyDesignType(design: string | undefined, type: string | undefined, required: boolean): string[] | null {
  if (required && !design)
    return !type
      ? [ "Required: study design", "Required: study type" ]
      : [ "Required: study design" ];

  if (design && !type)
    return [ "Required: study type" ];

  return null;
}

// TODO: Collapsible "Field or Clinical Study Characteristics"

interface DatasetCharacteristicsProps {
  readonly datasetMeta: DatasetFormData;
  readonly setter: FieldSetter<DatasetFormData>;
  readonly studyDesignSegment: JSXElementConstructor<any>;
}

export function CharacteristicsSegment({
  datasetMeta: { characteristics },
  setter,
  studyDesignSegment,
}: DatasetCharacteristicsProps): ReactElement<DatasetCharacteristicsProps> {

  const setField = function <K extends keyof DatasetCharacteristics>(key: K, value: DatasetCharacteristics[K]) {
    setter(prev => ({
      ...prev,
      characteristics: {
        ...(prev.characteristics ?? {}),
        [key]: value,
      },
    }));
  };

  // TODO: Conditionally required fields:
  //       - Study Design
  //       - Study Type
  /* TODO: if one is present, the other is required */

  const validate = (projectId: string): FormValidation => {
    let strictDesign = false;
    let strictContact = false;

    // FIXME: how do we handle project specific nonsense like this?
    switch (projectId) {
      case "MicrobiomeDB":
      // fallthrough
      case "ClinEpiDB":
        strictDesign = true;
        strictContact = true;
        break;
    }

    // validateStudyDesignType(studyDesign, studyType, strictDesign)
    validateYears(characteristics?.years?.start, characteristics?.years?.end);

    return {
      valid: false,
      errors: [],
    };
  };

  return (
    <div className="datasetCharacteristics">
      <h3>Dataset Characteristics</h3>
      <div className="formSection">
        <studyDesignSegment/>
        <LabeledTextListInput
          idPrefix={`${idPrefix}-countries`}
          className="datasetCharacteristicsStrings"
          subclass="countries"
          header="Countries"
          addRecordText="Additional country"
          records={characteristics?.countries}
          setRecords={it => setField("countries", it)}
        />
        <div className="dataset-year-range">
          <FieldLabel style={{ fontSize: "1.2em" }}>Study years</FieldLabel>
          {/*<LabeledTextInput*/}
          {/*  id={`${idPrefix}-years-start`}*/}
          {/*  label="Start year"*/}
          {/*  value={startYear}*/}
          {/*  onChange={setStartYear}*/}
          {/*/>*/}
        </div>
        <LabeledTextListInput
          idPrefix={`${idPrefix}-species`}
          className="datasetCharacteristicsStrings"
          subclass="species"
          header="Study species"
          addRecordText="Additional study species"
          records={characteristics?.studySpecies}
          setRecords={it => setField("studySpecies", it)}
        />
        <LabeledTextListInput
          idPrefix={`${idPrefix}-diseases`}
          className="datasetCharacteristicsStrings"
          subclass="diseases"
          header="Diseases or health conditions"
          addRecordText="Additional disease or health condition"
          records={characteristics?.diseases}
          setRecords={it => setField("diseases", it)}
        />
        <LabeledTextListInput
          idPrefix={`${idPrefix}-associated-factors`}
          className="datasetCharacteristicsStrings"
          subclass="associatedFactors"
          header="Associated factors"
          addRecordText="Additional risk factor"
          records={characteristics?.associatedFactors}
          setRecords={it => setField("associatedFactors", it)}
        />
        <LabeledTextInput
          id={`${idPrefix}-participant-ages`}
          label="Participant ages"
          value={characteristics?.participantAges}
          onChange={it => setField("participantAges", it)}
        />
        <LabeledTextListInput
          idPrefix={`${idPrefix}-sample-types`}
          className="datasetCharacteristicsStrings"
          subclass="sampleTypes"
          header="Sample types"
          addRecordText="Additional sample type"
          records={characteristics?.sampleTypes}
          setRecords={it => setField("sampleTypes", it)}
        />
      </div>
    </div>
  );
}