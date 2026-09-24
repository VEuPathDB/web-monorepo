import React, { ReactElement } from 'react';
import { AddRowButton, FieldHelpText, InputBlock, InputPair } from '../../index';
import { OptionalSection } from '../../OptionalSection';
import {
  arrayChangeHandler,
  JsonPathBuilder,
  BiConsumer,
  Consumer, isNonEmpty, isNonBlankString
} from '../../../../../Utils';
import { PartialDatasetDetails } from '../../../../../Service';
import { PartialOrganism } from '../../../../../Service/Model/request-types';
import { projectId } from '../../../../../config';
import { isGenomicsProjectId } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';

export interface OrganismDetailsProps {
  readonly setDatasetDetails: Consumer<PartialDatasetDetails>;
  readonly datasetMeta: PartialDatasetDetails;
  readonly jsonPath: JsonPathBuilder;
}

export function ExperimentalOrganisms(
  props: OrganismDetailsProps
): ReactElement {
  const { hasOrganismData } = props.datasetMeta.metadataContentFlags ?? {};

  const safeOrgList = isNonEmpty(props.datasetMeta.experimentalOrganisms)
    ? props.datasetMeta.experimentalOrganisms
    : [{}];

  const setEnabled = (enabled: boolean) =>
    props.setDatasetDetails({
      ...props.datasetMeta,
      metadataContentFlags: {
        ...(props.datasetMeta.metadataContentFlags ?? {}),
        hasOrganismData: enabled,
      },
    });

  const arrayCallback = arrayChangeHandler('experimentalOrganisms', props.datasetMeta, props.setDatasetDetails);

  const isGenomics = isGenomicsProjectId(projectId);

  const requireInput = !isGenomics
    ? hasOrganismData === true
    : props.datasetMeta.visibility === 'public';

  const disabled = isGenomics
    ? false
    : !hasOrganismData;

  const isPublic = props.datasetMeta.visibility === 'public';

  return (
    <>
      <InputBlock header="Organism Details">
        <OptionalSection
          toggle={{
            label: 'Includes Biological Data about Organisms?',
            enabled: hasOrganismData ?? null,
            setEnabled: setEnabled,
            fieldName: 'enable-organism-list',
            required: isPublic,
            helpText: 'Whether this dataset includes biological data'
              + ' describing one or more organisms.',
            hideToggle: isGenomics,
          }}
          className="field-grid"
        >
          <p className="subsection-description span-2">
            <h5>Pathogen or microorganism</h5><br/>
            Indicate the species and strain of each organism represented by
            biological data in this dataset. Organisms may include
            {!isGenomics &&
              ' the study population species in field studies or clinical trials and, where applicable,'}
            {' '}pathogens, vectors, symbionts, or other organisms represented directly or
            indirectly by the data.
            {isGenomics &&
              ' The organism species and strain may differ from the Reference Genome species and strain used for mapping or analysis.'}
          </p>

          <OrganismDetailsContent
            organisms={safeOrgList}
            setOrganism={arrayCallback}
            disabled={disabled}
            required={requireInput}
          />

          <AddRowButton
            title="Adds an additional contact entry."
            className="column-2"
            onClick={() => props.setDatasetDetails({
              ...props.datasetMeta,
              experimentalOrganisms: [ ...safeOrgList, {} ],
            })}
          >
            + Additional pathogen or microorganism
          </AddRowButton>
        </OptionalSection>
      </InputBlock>
    </>
  );
}

interface OrganismDetailListProps {
  readonly organisms: readonly PartialOrganism[];
  readonly setOrganism: BiConsumer<PartialOrganism, number>;
  readonly disabled: boolean;
  readonly required: boolean;
}

function OrganismDetailsContent(props: OrganismDetailListProps): ReactElement {
  return (
    <ol className="multi-input span-2">
      {props.organisms.map((org, index) =>
        <OrganismDetailsRow
          index={index}
          disabled={props.disabled}
          required={props.required && index === 0}
          organism={org}
          setOrganism={props.setOrganism}
        />
      )}
    </ol>
  );
}

interface DatasetOrganismRow {
  readonly index: number;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly organism: PartialOrganism;
  readonly setOrganism: BiConsumer<PartialOrganism, number>;
}

function OrganismDetailsRow({
  index,
  disabled,
  required,
  organism,
  setOrganism,
}: DatasetOrganismRow): ReactElement {
  const hasContent = isNonBlankString(organism.species) ||  isNonBlankString(organism.strain);
  return (
    <li className="field-grid">
      <InputPair<PartialOrganism>
        label="Species"
        type="text"
        fieldName="species"
        onChange={v => setOrganism({ ...organism, species: v }, index)}
        value={organism.species}
        required={required || hasContent}
        minLength={3}
        maxLength={128}
        disabled={disabled}
      />
      <FieldHelpText>
        Scientific name of the pathogen or microorganism that was detected,
        measured, characterized, or otherwise investigated (e.g., Plasmodium
        falciparum).
      </FieldHelpText>

      <InputPair<PartialOrganism>
        label="Strain"
        type="text"
        fieldName="strain"
        onChange={v => setOrganism({ ...organism, strain: v }, index)}
        value={organism.strain}
        required={required || hasContent}
        minLength={3}
        maxLength={128}
        disabled={disabled}
      />
      <FieldHelpText>
        For field-collected organisms without a defined strain, enter "field
        isolates" or "field samples".
      </FieldHelpText>
    </li>
  );
}
