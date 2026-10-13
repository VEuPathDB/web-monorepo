import React, { ReactElement } from 'react';
import { AddRowButton, InputBlock, InputPair } from '../../index';
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
            enabled: !disabled,
            setEnabled: setEnabled,
            fieldName: 'enable-organism-list',
            required: isPublic,
            helpText: 'Whether this dataset includes biological data describing one or more organisms.',
            hideToggle: isGenomics,
          }}
          className="field-grid"
        >
          <p className="subsection-description span-2">
            Indicate the species and strain of each organism represented by biological data in this dataset. Organisms
            may include
            {!isGenomics && ' the study population species in field studies or clinical trials and, where applicable,'}
            {' '}pathogens, vectors, symbionts, or other organisms represented directly or
            indirectly by the data.
            {isGenomics && ' The organism species and strain may differ from the Reference Organism species and strain'
              + ' used for mapping or analysis.'}
          </p>
          <ul className="subsection-description span-2">
            <li>
              <span className="underline">Species</span>: Provide the scientific name of the organism that was detected,
              measured, characterized, or otherwise represented in this dataset (e.g., Plasmodium falciparum).
            </li>
            <li>
              <span className="underline">Strain</span>: Indicate the strain, isolate, or laboratory line of the
              organism represented in this dataset, where applicable. For laboratory experiments, enter the specific
              experimental strain or line, including mutant or genetically modified lines. For field-collected organisms
              without a defined strain, enter “field isolates” or “field samples,” as appropriate. For organisms for
              which strain is not applicable, such as human study participants, enter “N/A”.
            </li>
          </ul>

          <OrganismDetailsContent
            organisms={safeOrgList}
            setOrganism={arrayCallback}
            disabled={disabled}
            required={requireInput}
          />

          <AddRowButton
            title="Adds an additional contact entry."
            className="column-2"
            onClick={() => {
              if (!disabled)
                props.setDatasetDetails({
                  ...props.datasetMeta,
                  experimentalOrganisms: [ ...safeOrgList, {} ]
                });
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
    <li className="non-bold-labels organism-row">
      <span className="multi-input-label">Organism {index + 1}</span>

      <div className="column-2 field-grid organism-row">
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
      </div>
    </li>
  );
}
