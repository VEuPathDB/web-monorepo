import React from "react";
import { DatasetCharacteristics, StudyYearRange } from "../../Service/Types";
import { LabeledTextInput, LabeledTextListInput } from "./LabeledInput";
import { FieldLabel } from "./FieldLabel";
import { FormValidation } from "../UploadForm";

const idPrefix = "dataset-characteristics";

interface CharacteristicsFormSegment {
  makeCharacteristicsModel(): DatasetCharacteristics;

  validateCharacteristics(projectId: string): FormValidation;

  CharacteristicsSegment: React.ReactElement;
}

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
  readonly StudyDesignSegment: () => React.ReactElement;
}

export function useCharacteristicsSegment(props: DatasetCharacteristicsProps): CharacteristicsFormSegment {
  // region Form State

  const [ countries, setCountries ] = React.useState<string[]>([]);
  const [ startYear, setStartYear ] = React.useState<number>();
  const [ endYear, setEndYear ] = React.useState<number>();
  const [ studySpecies, setStudySpecies ] = React.useState<string[]>([]);
  const [ diseases, setDiseases ] = React.useState<string[]>([]);
  const [ associatedFactors, setAssociatedFactors ] = React.useState<string[]>([]);
  const [ participantAges, setParticipantAges ] = React.useState<string>();
  const [ sampleTypes, setSampleTypes ] = React.useState<string[]>([]);

  // endregion Form State

  const makeModel = (): DatasetCharacteristics => ({
    countries,
    years: { start: startYear!!, end: endYear!! },
    studySpecies,
    diseases,
    associatedFactors,
    participantAges,
    sampleTypes,
  });

  // TODO: Conditionally required fields:
  //       - Study Design
  //       - Study Type
  /* TODO: if one is present, the other is required */

  const validate = (projectId: string): FormValidation => {
    let strictDesign = false
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
    validateYears(startYear, endYear)

    return {
      valid: false,
      errors: []
    };
  };

  return {
    makeCharacteristicsModel: makeModel,
    validateCharacteristics: validate,
    CharacteristicsSegment: (
      <div className="datasetCharacteristics">
        <h3>Dataset Characteristics</h3>
        <div className="formSection">
          <props.StudyDesignSegment />
          <LabeledTextListInput
            idPrefix={`${idPrefix}-countries`}
            className="datasetCharacteristicsStrings"
            subclass="countries"
            header="Countries"
            addRecordText="Additional country"
            records={countries}
            setRecords={setCountries}
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
            records={studySpecies}
            setRecords={setStudySpecies}
          />
          <LabeledTextListInput
            idPrefix={`${idPrefix}-diseases`}
            className="datasetCharacteristicsStrings"
            subclass="diseases"
            header="Diseases or health conditions"
            addRecordText="Additional disease or health condition"
            records={diseases}
            setRecords={setDiseases}
          />
          <LabeledTextListInput
            idPrefix={`${idPrefix}-associated-factors`}
            className="datasetCharacteristicsStrings"
            subclass="associatedFactors"
            header="Associated factors"
            addRecordText="Additional risk factor"
            records={associatedFactors}
            setRecords={setAssociatedFactors}
          />
          <LabeledTextInput
            id={`${idPrefix}-participant-ages`}
            label="Participant ages"
            value={participantAges}
            onChange={setParticipantAges}
          />
          <LabeledTextListInput
            idPrefix={`${idPrefix}-sample-types`}
            className="datasetCharacteristicsStrings"
            subclass="sampleTypes"
            header="Sample types"
            addRecordText="Additional sample type"
            records={sampleTypes}
            setRecords={setSampleTypes}
          />
        </div>
      </div>
    ),
  };
}