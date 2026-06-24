import React, { ReactElement, RefObject, useEffect, useMemo, useRef } from 'react';
import { partialRight } from 'lodash';

import {
  Consumer,
  JsonPathBuilder,
  changeHandler,
  BiConsumer,
} from '../../../../../Utils';
import {
  PartialDatasetDetails,
  PartialCharacteristics,
  SampleYearRange,
} from '../../../../../Service';
import {
  GrowableStringList,
  InputBlock,
  InputPair,
  YesNoToggle,
} from '../../index';
import { ClientSideUploadFormState } from '../../../../../StoreModules';
import { DatasetCharacteristicsFormSectionConfig } from '../../../../Configuration/DatasetFormConfig';

export const FieldStudyToggleID = 'field-study-toggle';

export interface CharacteristicsSectionProps {
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly pathBuilder: JsonPathBuilder;
  readonly formProps: DatasetCharacteristicsFormSectionConfig;
}

export function CharacteristicsSection({
  datasetMeta: metadata,
  setDatasetMeta: setMetadata,
  clientSideState,
  setClientSideState,
  pathBuilder: jsonPath,
  formProps,
}: CharacteristicsSectionProps): ReactElement {
  const { isStudy: enabled } = clientSideState;

  const setEnabled = (enabled: boolean) =>
    setClientSideState({ ...clientSideState, isStudy: enabled });

  useEffect(
    () => {
      if (enabled === undefined && metadata.datasetCharacteristics !== undefined)
        setEnabled(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ enabled, metadata.datasetCharacteristics ],
  );

  const safeCharacteristics = metadata.datasetCharacteristics ?? {
    studyDesign: formProps.studyDesignVocab[0][0],
    studyType: formProps.studyDesignVocab[0][1],
  };

  const requireAll = useMemo(
    () => enabled === true && metadata.visibility === 'public',
    [enabled, metadata.visibility]
  );

  const setRootField = partialRight(
    changeHandler<PartialCharacteristics>,
    safeCharacteristics,
    (v) => setMetadata({ ...metadata, datasetCharacteristics: v })
  );

  const disabledClass = enabled ? '' : ' disabled-fields';

  return (
    <InputBlock
      header="Field Study or Clinical Trial Characteristics"
      isCommunityRelated={true}
    >
      <div className={'field-grid' + disabledClass}>
        <label className="not-disabled" id={FieldStudyToggleID}>
          Field Study or Clinical Trial?
        </label>
        <YesNoToggle
          value={enabled}
          setValue={setEnabled}
          fieldName="enable-characteristics"
          className="not-disabled"
          helpText={
            'Whether the dataset or underlying samples originated from a' +
            ' human, vector, animal, or plant population study; an' +
            ' epidemiological or surveillance study; or a clinical trial.'
          }
        />

        <StudyDesign
          vocab={formProps.studyDesignVocab}
          enabled={enabled === true}
          required={requireAll}
          onChange={(d, t) => {
            setMetadata({
              ...metadata,
              datasetCharacteristics: {
                ...safeCharacteristics,
                studyDesign: d,
                studyType: t,
              },
            });
          }}
        />

        <GrowableStringList
          labelPlural="Countries"
          labelSingular="Country"
          values={safeCharacteristics.countries}
          required={requireAll}
          setValues={setRootField('countries')}
          jsonPath={jsonPath.append<PartialCharacteristics>('countries')}
          disabled={enabled !== true}
          helpText={
            'Country where data or samples were collected from the study population.'
          }
        />

        <YearsInputs
          years={safeCharacteristics.years}
          setYears={setRootField('years')}
          required={requireAll}
          jsonPath={jsonPath.append<PartialCharacteristics>('years')}
          disabled={enabled !== true}
        />

        <GrowableStringList
          labelPlural="Study Population Species"
          labelSingular="Study Population Species"
          required={requireAll}
          values={safeCharacteristics.studySpecies}
          setValues={setRootField('studySpecies')}
          jsonPath={jsonPath.append<PartialCharacteristics>('studySpecies')}
          disabled={enabled !== true}
          helpText={
            'Scientific name of the population the study is based on (e.g.,' +
            ' Homo sapiens), even if the dataset contains laboratory' +
            ' measurements on pathogens or other organisms.'
          }
        />

        <GrowableStringList
          labelPlural="Outcomes of Interest"
          labelSingular="Outcome"
          required={requireAll}
          values={safeCharacteristics.outcomes}
          setValues={setRootField('outcomes')}
          jsonPath={jsonPath.append<PartialCharacteristics>('outcomes')}
          disabled={enabled !== true}
          helpText={
            'Primary disease, condition, or outcome being studied (e.g.,' +
            ' malaria, anemia, or treatment failure). Enter ‘N/A’ if not applicable.'
          }
        />

        <GrowableStringList
          labelPlural="Associated Factors"
          labelSingular="Associated Factor"
          required={requireAll}
          values={safeCharacteristics.associatedFactors}
          setValues={setRootField('associatedFactors')}
          jsonPath={jsonPath.append<PartialCharacteristics>('associatedFactors')}
          disabled={enabled !== true}
          helpText={
            'Pathogen, exposure, or risk factor associated with the outcome' +
            ' (e.g., Plasmodium falciparum, or insecticide exposure).' +
            ' Use scientific names for pathogens. Enter ‘N/A’ if not applicable.'
          }
        />

        <InputPair<PartialCharacteristics>
          fieldName="participantAges"
          label="Participant Ages"
          disabled={enabled !== true}
          required={requireAll}
          helpText="Age range(s) of participants when data were collected (e.g., '0-5 years; 18+ years'). Specify units. Enter ‘N/A’ if not applicable."
          value={safeCharacteristics.participantAges}
          onChange={setRootField('participantAges')}
        />

        <GrowableStringList
          labelPlural="Sample Types"
          labelSingular="Sample Type"
          required={requireAll}
          values={safeCharacteristics.sampleTypes}
          setValues={setRootField('sampleTypes')}
          jsonPath={jsonPath.append<PartialCharacteristics>('sampleTypes')}
          disabled={enabled !== true}
          helpText={
            'Type(s) of biological or environmental samples represented in' +
            ' this dataset. Enter ‘N/A’ if not applicable.'
          }
        />
      </div>
    </InputBlock>
  );
}

// region Study Design

interface StudyDesignProps {
  readonly vocab: readonly [string, string][];
  readonly onChange: BiConsumer<string, string>;
  readonly enabled: boolean;
  readonly required: boolean;
}

function StudyDesign({
  vocab,
  onChange,
  enabled,
  required,
}: StudyDesignProps): ReactElement {
  const options = vocab.map(([v, _], i) => (
    <option key={i} value={i}>
      {v}
    </option>
  ));

  return (
    <>
      <label htmlFor="meta.studyCharacteristics.studyDesign">
        Study Design
      </label>
      <select
        id="meta.studyCharacteristics.studyDesign"
        onChange={(e) => {
          const [design, type] = vocab[parseInt(e.currentTarget.value ?? '0')];
          onChange(design, type);
        }}
        disabled={!enabled}
        required={required}
      >
        {options}
      </select>
    </>
  );
}

// endregion Study Design

// region Years

interface YearsInputsProps {
  readonly years: Partial<SampleYearRange> | undefined;
  readonly setYears: Consumer<Partial<SampleYearRange>>;
  readonly jsonPath: JsonPathBuilder;
  readonly disabled: boolean;
  readonly required: boolean;
}

function YearsInputs({
  years,
  setYears,
  jsonPath,
  disabled,
  required,
}: YearsInputsProps): ReactElement {
  const safeYears = years ?? {};

  const startField = jsonPath.appendToString<SampleYearRange>('start');
  const endField = jsonPath.appendToString<SampleYearRange>('end');

  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const setYear = disabled
    ? () => {}
    : (
      k: keyof SampleYearRange,
      v: string | undefined,
      ref: RefObject<HTMLInputElement>,
    ) => {
      if (!v)
        return;

      const parsed = parseInt(v);

      if (isNaN(parsed))
        return;

      if (parsed < 1500 || parsed > 9999)
        ref.current?.classList?.add('invalid')
      else
        ref.current?.classList?.remove('invalid')

      setYears({ ...safeYears, [k]: parsed });
    };

  return (
    <>
      <InputPair
        label="Start Year"
        type="text"
        inputRef={startRef}
        fieldName={startField}
        helpText="Year (YYYY) when data collection was initiated."
        value={safeYears.start?.toString()}
        onChange={(v) => setYear('start', v, startRef)}
        disabled={disabled}
        required={required || !!safeYears.end}
      />

      <InputPair
        label="End Year"
        type="text"
        inputRef={endRef}
        fieldName={endField}
        helpText="Year (YYYY) when data collection was concluded."
        value={safeYears.end?.toString()}
        onChange={(v) => setYear('end', v, endRef)}
        disabled={disabled}
        required={required || !!safeYears.start}
      />
    </>
  );
}

// endregion Years
