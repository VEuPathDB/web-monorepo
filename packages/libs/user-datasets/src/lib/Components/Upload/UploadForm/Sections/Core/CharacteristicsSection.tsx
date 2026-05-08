import { ReactElement, useState } from 'react';
import { partialRight } from 'lodash';

import { Consumer, JsonPathBuilder, changeHandler } from '../../../../../Utils';
import {
  DatasetPostDetails,
  PostCharacteristics,
  SampleYearRange,
} from '../../../../../Service';
import { GrowableStringList, InputPair } from '../../Components';
import { ClientSideUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';

export interface CharacteristicsSectionProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly pathBuilder: JsonPathBuilder;
}

export function CharacteristicsSection({
  datasetMeta: metadata,
  setDatasetMeta: setMetadata,
  clientSideState,
  setClientSideState,
  pathBuilder: jsonPath,
}: CharacteristicsSectionProps): ReactElement {
  const { isStudy: enabled } = clientSideState;
  const safeCharacteristics = metadata.datasetCharacteristics ?? {};

  const setEnabled = (enabled: boolean) =>
    setClientSideState({ ...clientSideState, isStudy: enabled });

  const setRootField = partialRight(
    changeHandler<PostCharacteristics>,
    safeCharacteristics,
    (v) => setMetadata({ ...metadata, datasetCharacteristics: v })
  );

  return (
    <div className="input-block">
      <h4>Field Study or Clinical Trial Characteristics</h4>

      <div className="field-grid">
        <InputPair
          type="checkbox"
          label="Field Study or Clinical Trial"
          fieldName="enable-characteristics"
          helpText={
            'Whether the dataset is from a human, vector, animal, or plant' +
            ' population study; an epidemiological study (including' +
            ' surveillance); or a clinical trial'
          }
          checked={enabled}
          onChange={setEnabled}
        />

        <label htmlFor="meta.studyCharacteristics.studyDesign">
          Study Design
        </label>
        <select id="meta.studyCharacteristics.studyDesign">
          <option>nope</option>
        </select>

        <GrowableStringList
          labelPlural="Countries"
          labelSingular="Country"
          values={safeCharacteristics.countries}
          setValues={setRootField('countries')}
          jsonPath={jsonPath.append<PostCharacteristics>('countries')}
          disabled={!enabled}
        />

        <YearsInputs
          years={safeCharacteristics.years}
          setYears={setRootField('years')}
          jsonPath={jsonPath.append<PostCharacteristics>('years')}
          disabled={!enabled}
        />

        <GrowableStringList
          labelPlural="Study Population Species"
          labelSingular="Study Population Species"
          values={safeCharacteristics.studySpecies}
          setValues={setRootField('studySpecies')}
          jsonPath={jsonPath.append<PostCharacteristics>('studySpecies')}
          disabled={!enabled}
          helpText={
            'Scientific name of the population the study is based on (e.g.,' +
            ' Homo sapiens), even if the dataset contains laboratory' +
            ' measurements on pathogens or other organisms.'
          }
        />

        <GrowableStringList
          labelPlural="Outcomes of Interest"
          labelSingular="Outcome"
          values={safeCharacteristics.outcomes}
          setValues={setRootField('outcomes')}
          jsonPath={jsonPath.append<PostCharacteristics>('outcomes')}
          disabled={!enabled}
          helpText={
            'Primary disease, condition, or outcome being studied (e.g.,' +
            ' malaria, anemia, or treatment failure).'
          }
        />

        <GrowableStringList
          labelPlural="Associated Factors"
          labelSingular="Associated Factor"
          values={safeCharacteristics.associatedFactors}
          setValues={setRootField('associatedFactors')}
          jsonPath={jsonPath.append<PostCharacteristics>('associatedFactors')}
          disabled={!enabled}
          helpText={
            'Pathogen, exposure, or risk factor associated with the outcome' +
            ' (e.g., Plasmodium falciparum, or insecticide exposure).' +
            ' Use scientific names for pathogens.'
          }
        />

        <InputPair<PostCharacteristics>
          fieldName="participantAges"
          label="Participant Ages"
          disabled={!enabled}
          helpText="Age range(s) of participants when data were collected (e.g., '0-5 years; 18+ years')."
          onChange={setRootField('participantAges')}
        />

        <GrowableStringList
          labelPlural="Sample Types"
          labelSingular="Sample Type"
          values={safeCharacteristics.sampleTypes}
          setValues={setRootField('sampleTypes')}
          jsonPath={jsonPath.append<PostCharacteristics>('sampleTypes')}
          disabled={!enabled}
          helpText={
            'Type(s) of biological or environmental samples represented in' +
            ' this dataset.'
          }
        />
      </div>
    </div>
  );
}

// region Years

interface YearsInputsProps {
  readonly years: Partial<SampleYearRange> | undefined;
  readonly setYears: Consumer<Partial<SampleYearRange>>;
  readonly jsonPath: JsonPathBuilder;
  readonly disabled: boolean;
}

function YearsInputs({
  years,
  setYears,
  jsonPath,
  disabled,
}: YearsInputsProps): ReactElement {
  const safeYears = years ?? {};

  const startField = jsonPath.appendToString<SampleYearRange>('start');
  const endField = jsonPath.appendToString<SampleYearRange>('end');

  const setYear = disabled
    ? () => {}
    : (k: keyof SampleYearRange, v: string | undefined) => {
        if (!v) return;

        const value = parseInt(v);

        if (isNaN(value)) return;

        setYears({ ...safeYears, [k]: value });
      };

  return (
    <>
      <InputPair
        label="Start Year"
        fieldName={startField}
        helpText="Year (YYYY) when data collection was initiated."
        value={safeYears.start?.toString()}
        onChange={(v) => setYear('start', v)}
        disabled={disabled}
      />

      <InputPair
        label="End Year"
        fieldName={endField}
        helpText="Year (YYYY) when data collection was concluded."
        value={safeYears.end?.toString()}
        onChange={(v) => setYear('end', v)}
        disabled={disabled}
      />
    </>
  );
}

// endregion Years
