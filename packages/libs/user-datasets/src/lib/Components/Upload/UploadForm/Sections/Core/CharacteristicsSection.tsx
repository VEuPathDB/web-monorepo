import { ReactElement } from 'react';
import { partialRight } from 'lodash';

import {
  Consumer,
  JsonPathBuilder,
  changeHandler,
  BiConsumer,
} from '../../../../../Utils';
import {
  DatasetPostDetails,
  PostCharacteristics,
  SampleYearRange,
} from '../../../../../Service';
import {
  GlobeIcon,
  GrowableStringList,
  InputBlock,
  InputPair,
  YesNoToggle,
} from '../../Components';
import { ClientSideUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';
import { DatasetCharacteristicsFormSectionConfig } from '../../../Configuration/DatasetUploadConfig';

export const FieldStudyToggleID = 'field-study-toggle';

export interface CharacteristicsSectionProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
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
  const safeCharacteristics = metadata.datasetCharacteristics ?? {
    studyDesign: formProps.studyDesignVocab[0][0],
    studyType: formProps.studyDesignVocab[0][1],
  };

  const setEnabled = (enabled: boolean) =>
    setClientSideState({ ...clientSideState, isStudy: enabled });

  const setRootField = partialRight(
    changeHandler<PostCharacteristics>,
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
          Field Study or Clinical Trial
        </label>
        <YesNoToggle
          value={enabled}
          setValue={setEnabled}
          fieldName="enable-characteristics"
          className="not-disabled"
          helpText={
            'Whether the dataset is from a human, vector, animal, or plant' +
            ' population study; an epidemiological study (including' +
            ' surveillance); or a clinical trial'
          }
        />

        <StudyDesign
          vocab={formProps.studyDesignVocab}
          enabled={enabled === true}
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
          setValues={setRootField('countries')}
          jsonPath={jsonPath.append<PostCharacteristics>('countries')}
          disabled={enabled !== true}
        />

        <YearsInputs
          years={safeCharacteristics.years}
          setYears={setRootField('years')}
          jsonPath={jsonPath.append<PostCharacteristics>('years')}
          disabled={enabled !== true}
        />

        <GrowableStringList
          labelPlural="Study Population Species"
          labelSingular="Study Population Species"
          values={safeCharacteristics.studySpecies}
          setValues={setRootField('studySpecies')}
          jsonPath={jsonPath.append<PostCharacteristics>('studySpecies')}
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
          values={safeCharacteristics.outcomes}
          setValues={setRootField('outcomes')}
          jsonPath={jsonPath.append<PostCharacteristics>('outcomes')}
          disabled={enabled !== true}
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
          disabled={enabled !== true}
          helpText={
            'Pathogen, exposure, or risk factor associated with the outcome' +
            ' (e.g., Plasmodium falciparum, or insecticide exposure).' +
            ' Use scientific names for pathogens.'
          }
        />

        <InputPair<PostCharacteristics>
          fieldName="participantAges"
          label="Participant Ages"
          disabled={enabled !== true}
          helpText="Age range(s) of participants when data were collected (e.g., '0-5 years; 18+ years')."
          value={safeCharacteristics.participantAges}
          onChange={setRootField('participantAges')}
        />

        <GrowableStringList
          labelPlural="Sample Types"
          labelSingular="Sample Type"
          values={safeCharacteristics.sampleTypes}
          setValues={setRootField('sampleTypes')}
          jsonPath={jsonPath.append<PostCharacteristics>('sampleTypes')}
          disabled={enabled !== true}
          helpText={
            'Type(s) of biological or environmental samples represented in' +
            ' this dataset.'
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
}

function StudyDesign({
  vocab,
  onChange,
  enabled,
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
    : (k: keyof SampleYearRange, v: number | undefined) => {
        if (!v) return;

        if (isNaN(v)) return;

        setYears({ ...safeYears, [k]: v });
      };

  return (
    <>
      <InputPair
        label="Start Year"
        type="number"
        minimum={1500}
        fieldName={startField}
        helpText="Year (YYYY) when data collection was initiated."
        value={safeYears.start}
        onChange={(v) => setYear('start', v)}
        disabled={disabled}
      />

      <InputPair
        label="End Year"
        type="number"
        minimum={1500}
        fieldName={endField}
        helpText="Year (YYYY) when data collection was concluded."
        value={safeYears.end}
        onChange={(v) => setYear('end', v)}
        disabled={disabled}
      />
    </>
  );
}

// endregion Years
