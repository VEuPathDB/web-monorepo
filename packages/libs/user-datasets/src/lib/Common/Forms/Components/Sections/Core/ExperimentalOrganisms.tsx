import React from 'react';

import { AddRowButton, InputBlock, LabelInputPair } from '../../index';
import { OptionalSection } from '../../OptionalSection';
import {
  JsonPathBuilder,
  BiConsumer,
  isNonEmpty,
  isNonBlank,
  newTextLengthTest,
  replaceElement,
} from '../../../../../Utils';
import { PartialDatasetDetails, PartialOrganism } from '../../../../../Service/Model';
import { projectId } from '../../../../../config';
import { isGenomicsProjectId } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';
import { useDispatch } from 'react-redux';
import {
  overwriteMetaField,
  patchContentFlags,
} from '../../../../../Actions/DatasetMetadataFormActions';
import { useMetadataSelector } from '../../../Hooks/dataset-metadata-hooks';

export interface OrganismDetailsProps {
  readonly jsonPath: JsonPathBuilder;
}

export function ExperimentalOrganisms(
  props: OrganismDetailsProps
): React.ReactElement {
  const jsonPath = props.jsonPath.append<PartialDatasetDetails>('experimentalOrganisms');

  const dispatch = useDispatch();

  const {
    isPublic = false,
    organismList,
    hasOrganismData,
  } = useMetadataSelector(it => ({
    isPublic: it.visibility === 'public',
    organismList: it.experimentalOrganisms,
    hasOrganismData: it.metadataContentFlags?.hasOrganismData,
  })) ?? {};

  const safeOrgList = isNonEmpty(organismList) ? organismList : [{}];

  const setEnabled = React.useCallback(
    (enabled: boolean) =>
      dispatch(patchContentFlags({ hasOrganismData: enabled })),
    [dispatch]
  );

  const setOrganisms = React.useCallback(
    (organisms: ReadonlyArray<PartialOrganism>) =>
      dispatch(overwriteMetaField('experimentalOrganisms', organisms)),
    [dispatch],
  );
  const setOrganism = React.useCallback(
    (org: PartialOrganism, index: number) =>
      setOrganisms(replaceElement(organismList, index, org)),
    [setOrganisms, organismList]
  )

  const isGenomics = isGenomicsProjectId(projectId);

  const requireInput = !isGenomics ? hasOrganismData === true : isPublic;

  const disabled = isGenomics ? false : !hasOrganismData;
  const enabled = isGenomics ? true : hasOrganismData;

  return (
    <>
      <InputBlock header="Organism Details">
        <OptionalSection
          toggle={{
            label: 'Includes Biological Data about Organisms?',
            enabled: enabled,
            setEnabled: setEnabled,
            fieldName: 'enable-organism-list',
            required: isPublic || (enabled ?? false),
            helpText:
              'Whether this dataset includes biological data describing one or more organisms.',
            hideToggle: isGenomics,
          }}
          className="field-grid"
        >
          <p className="subsection-description span-2">
            Indicate the species and strain of each organism represented by
            biological data in this dataset. Organisms may include
            {!isGenomics &&
              ' the study population species in field studies or clinical trials and, where applicable,'}{' '}
            pathogens, vectors, symbionts, or other organisms represented
            directly or indirectly by the data.
            {isGenomics &&
              ' The organism species and strain may differ from the Reference Organism species and strain' +
                ' used for mapping or analysis.'}
          </p>
          <ul className="subsection-description span-2">
            <li>
              <span className="underline">Species</span>: Provide the scientific
              name of the organism that was detected, measured, characterized,
              or otherwise represented in this dataset (e.g., Plasmodium
              falciparum).
            </li>
            <li>
              <span className="underline">Strain</span>: Indicate the strain,
              isolate, or laboratory line of the organism represented in this
              dataset, where applicable. For laboratory experiments, enter the
              specific experimental strain or line, including mutant or
              genetically modified lines. For field-collected organisms without
              a defined strain, enter “field isolates” or “field samples,” as
              appropriate. For organisms for which strain is not applicable,
              such as human study participants, enter “N/A”.
            </li>
          </ul>

          <OrganismDetailsContent
            jsonPath={jsonPath}
            organisms={safeOrgList}
            setOrganism={setOrganism}
            disabled={disabled}
            required={requireInput}
          />

          <AddRowButton
            title="Adds an additional contact entry."
            className="column-2"
            onClick={() => {
              if (!disabled)
                setOrganisms([...safeOrgList, {}]);
            }}
          >
            + Additional organism
          </AddRowButton>
        </OptionalSection>
      </InputBlock>
    </>
  );
}

interface OrganismDetailListProps {
  readonly jsonPath: JsonPathBuilder;
  readonly organisms: ReadonlyArray<PartialOrganism>;
  readonly setOrganism: BiConsumer<PartialOrganism, number>;
  readonly disabled: boolean;
  readonly required: boolean;
}

function OrganismDetailsContent(props: OrganismDetailListProps): React.ReactElement {
  return (
    <ol className="multi-input span-2">
      {props.organisms.map((org, index) => (
        <OrganismDetailsRow
          key={index}
          index={index}
          jsonPath={props.jsonPath.append(index)}
          disabled={props.disabled}
          required={props.required && index === 0}
          organism={org}
          setOrganism={props.setOrganism}
        />
      ))}
    </ol>
  );
}

interface DatasetOrganismRow {
  readonly index: number;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly organism: PartialOrganism;
  readonly setOrganism: BiConsumer<PartialOrganism, number>;
  readonly jsonPath: JsonPathBuilder;
}

const TEST_ORG_TEXT = newTextLengthTest(3, 128);

function OrganismDetailsRow({
  index,
  disabled,
  required,
  organism,
  setOrganism,
  jsonPath,
}: DatasetOrganismRow): React.ReactElement {
  const hasContent = isNonBlank(organism.species)
    || isNonBlank(organism.strain);

  return (
    <li className="non-bold-labels organism-row">
      <span className="multi-input-label">Organism {index + 1}</span>

      <div className="column-2 field-grid organism-row">
        <LabelInputPair
          label="Species"
          type="text"
          fieldName={jsonPath.appendToString<PartialOrganism>('species')}
          onChange={(v) => setOrganism({ ...organism, species: v }, index)}
          value={organism.species}
          required={required || hasContent}
          validator={TEST_ORG_TEXT}
          disabled={disabled}
        />

        <LabelInputPair
          label="Strain"
          type="text"
          fieldName={jsonPath.appendToString<PartialOrganism>('strain')}
          onChange={(v) => setOrganism({ ...organism, strain: v }, index)}
          value={organism.strain}
          required={required || hasContent}
          validator={TEST_ORG_TEXT}
          disabled={disabled}
        />
      </div>
    </li>
  );
}
