import React from 'react';

import {
  BiConsumer,
  Consumer,
  JsonPathBuilder,
  Possible,
} from '../../../../../Utils';
import {
  PartialCharacteristics,
  SampleYearRange,
} from '../../../../../Service';
import {
  FieldHelpText,
  GrowableStringList,
  InputBlock,
  LabelInputPair,
  YesNoToggle,
} from '../../index';
import {
  DatasetCharacteristicsFormSectionConfig,
  StudyDesignOption,
} from '../../../../Configuration/DatasetFormConfig';
import { useDispatch } from 'react-redux';
import { useCharacteristics, useContentFlags, useDatasetVisibility } from '../../../Hooks/dataset-metadata-hooks';
import { updateCharacteristics, updateContentFlags } from '../../../../../Actions/DatasetMetadataFormActions';

export const FieldStudyToggleID = 'field-study-toggle';

export interface CharacteristicsSectionProps {
  readonly pathBuilder: JsonPathBuilder;
  readonly formProps: DatasetCharacteristicsFormSectionConfig;
}

export function CharacteristicsSection({
  pathBuilder: jsonPath,
  formProps,
}: CharacteristicsSectionProps): React.ReactElement {
  const dispatch = useDispatch();

  const contentFlags = useContentFlags();
  const enabled = contentFlags?.hasDatasetCharacteristics;
  const setEnabled = React.useCallback(
    (enabled: boolean) => dispatch(updateContentFlags({
      ...contentFlags,
      hasDatasetCharacteristics: enabled,
    })),
    [dispatch, contentFlags],
  );

  const characteristics = useCharacteristics();
  const setCharacteristics = React.useCallback(
    (characteristics: PartialCharacteristics) => dispatch(updateCharacteristics(characteristics)),
    [dispatch],
  );
  const setCharacteristic = React.useCallback(
    (key: keyof PartialCharacteristics, value: PartialCharacteristics[typeof key]) =>
      setCharacteristics({ ...characteristics, [key]: value }),
    [characteristics, setCharacteristics],
  );

  if (enabled === undefined && characteristics !== undefined) {
    setEnabled(true);
  }

  const safeCharacteristics = characteristics ?? {};

  const isPublic = useDatasetVisibility() === 'public';

  const requireAll = React.useMemo(
    () => enabled === true && isPublic,
    [enabled, isPublic]
  );

  const disabledClass = enabled ? '' : ' disabled-fields';

  return (
    <InputBlock header="Field Study or Clinical Trial Characteristics">
      <div className={'field-grid' + disabledClass}>
        <label
          className={'not-disabled' + (isPublic ? ' required' : '')}
          id={FieldStudyToggleID}
        >
          Field Study or Clinical Trial?
        </label>
        <YesNoToggle
          value={enabled}
          required={isPublic}
          setValue={setEnabled}
          fieldName="enable-characteristics"
          className="not-disabled"
          disableRequiredStyling={true}
          helpText={
            'Whether the dataset or underlying samples originated from a human, vector, animal, or plant population'
            + ' study; an epidemiological or surveillance study; or a clinical trial.'
          }
        />

        <StudyDesign
          vocab={formProps.studyDesignVocab}
          enabled={enabled === true}
          required={requireAll}
          selection={characteristics?.studyDesign}
          onChange={(studyDesign, studyType) =>
            setCharacteristics({ ...characteristics, studyDesign, studyType })
          }
        />

        <GrowableStringList
          labelPlural="Countries"
          labelSingular="Country"
          values={safeCharacteristics.countries}
          required={requireAll}
          setValues={it => setCharacteristic('countries', it)}
          jsonPath={jsonPath.append<PartialCharacteristics>('countries')}
          disabled={enabled !== true}
          helpText="Country where data or samples were collected from the study population."
        />

        <YearsInputs
          years={safeCharacteristics.years}
          setYears={it => setCharacteristic('years', it)}
          required={requireAll}
          jsonPath={jsonPath.append<PartialCharacteristics>('years')}
          disabled={enabled !== true}
        />

        <GrowableStringList
          labelPlural="Study Population Species"
          labelSingular="Study Population Species"
          required={requireAll}
          values={safeCharacteristics.studySpecies}
          setValues={it => setCharacteristic('studySpecies', it)}
          jsonPath={jsonPath.append<PartialCharacteristics>('studySpecies')}
          disabled={enabled !== true}
          helpText={
            'Scientific name of the population the study is based on (e.g., Homo sapiens), even if the dataset'
            + ' contains laboratory measurements on pathogens or other organisms.'
          }
        />

        <GrowableStringList
          labelPlural="Outcomes of Interest"
          labelSingular="Outcome"
          required={requireAll}
          values={safeCharacteristics.outcomes}
          setValues={it => setCharacteristic('outcomes', it)}
          jsonPath={jsonPath.append<PartialCharacteristics>('outcomes')}
          disabled={enabled !== true}
          helpText={
            'Primary disease, condition, or outcome being studied (e.g., malaria, anemia, or treatment failure).'
            + ' Enter ‘N/A’ if not applicable.'
          }
        />

        <GrowableStringList
          labelPlural="Associated Factors"
          labelSingular="Associated Factor"
          required={requireAll}
          values={safeCharacteristics.associatedFactors}
          setValues={it => setCharacteristic('associatedFactors', it)}
          jsonPath={jsonPath.append<PartialCharacteristics>(
            'associatedFactors'
          )}
          disabled={enabled !== true}
          helpText={
            'Pathogen, exposure, or risk factor associated with the outcome (e.g., Plasmodium falciparum, or'
            + ' insecticide exposure). Use scientific names for pathogens. Enter ‘N/A’ if not applicable.'
          }
        />

        <LabelInputPair<PartialCharacteristics>
          type="text"
          fieldName="participantAges"
          label="Participant Ages"
          disabled={enabled !== true}
          required={requireAll}
          helpText={
            'Age range(s) of participants when data were collected (e.g., \'0-5 years; 18+ years\'). Specify units.'
            + ' Enter ‘N/A’ if not applicable.'
          }
          value={safeCharacteristics.participantAges}
          onChange={it => setCharacteristic('participantAges', it)}
        />

        <GrowableStringList
          labelPlural="Sample Types"
          labelSingular="Sample Type"
          required={requireAll}
          values={safeCharacteristics.sampleTypes}
          setValues={it => setCharacteristic('sampleTypes', it)}
          jsonPath={jsonPath.append<PartialCharacteristics>('sampleTypes')}
          disabled={enabled !== true}
          helpText={
            'Type(s) of biological or environmental samples represented in this dataset. Enter ‘N/A’ if not applicable.'
          }
        />
      </div>
    </InputBlock>
  );
}

// region Study Design

interface StudyDesignProps {
  readonly vocab: readonly StudyDesignOption[];
  readonly onChange: BiConsumer<string, string>;
  readonly enabled: boolean;
  readonly required: boolean;
  readonly selection?: String;
}

function StudyDesign({
  vocab,
  onChange,
  enabled,
  required,
  selection,
}: StudyDesignProps): React.ReactElement {
  const options = [
    <option key={vocab.length} disabled selected={selection == null}>
      Select a study design
    </option>,

    ...vocab.map(({ design }, i) => (
      <option key={i} value={i} selected={selection === design}>
        {design}
      </option>
    )),
  ];

  const help = vocab.find(({ design }) => design === selection)?.help;

  let className: Possible<string> = undefined;

  if (required) {
    className = selection == null ? 'required invalid' : 'required';
  }

  return (
    <>
      <label
        htmlFor="meta.studyCharacteristics.studyDesign"
        className={className}
      >
        Study Design
      </label>
      <select
        id="meta.studyCharacteristics.studyDesign"
        onChange={(e) => {
          const { design, studyType } =
            vocab[parseInt(e.currentTarget.value ?? '0')];
          onChange(design, studyType);
        }}
        disabled={!enabled}
        required={required}
      >
        {options}
      </select>
      {selection == null ? (
        <FieldHelpText>
          Select a study design to see a short description of it.
        </FieldHelpText>
      ) : (
        help != null && <FieldHelpText>{help}</FieldHelpText>
      )}
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
}: YearsInputsProps): React.ReactElement {
  const safeYears = years ?? {};

  const startField = jsonPath.appendToString<SampleYearRange>('start');
  const endField = jsonPath.appendToString<SampleYearRange>('end');

  const startRef = React.useRef<HTMLInputElement>(null);
  const endRef = React.useRef<HTMLInputElement>(null);

  const setYear = disabled
    ? () => {}
    : (
        k: keyof SampleYearRange,
        v: string | undefined,
        ref: React.RefObject<HTMLInputElement>
      ) => {
        ref.current?.classList?.remove('invalid');

        if (!v) {
          const { [k]: ignored, ...trimmed } = safeYears;
          setYears(trimmed);
          return;
        }

        const parsed = parseInt(v);

        if (isNaN(parsed)) {
          const { [k]: ignored, ...trimmed } = safeYears;
          setYears(trimmed);
          return;
        }

        if (parsed < 1500 || parsed > 9999)
          ref.current?.classList?.add('invalid');

        setYears({ ...safeYears, [k]: parsed });
      };

  return (
    <>
      <LabelInputPair
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

      <LabelInputPair
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
