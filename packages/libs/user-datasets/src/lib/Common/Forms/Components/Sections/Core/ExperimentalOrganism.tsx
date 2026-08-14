import React, { ReactElement } from 'react';
import { FieldHelpText, InputBlock, InputPair, YesNoToggle } from '../../index';
import { partialRight } from 'lodash';
import {
  changeHandler,
  isNonBlankString,
  Consumer,
  JsonPathBuilder,
} from '../../../../../Utils';
import { PartialDatasetDetails } from '../../../../../Service';
import { PartialOrganism } from '../../../../../Service/Model/request-types';
import { ClientSideUploadFormState } from '../../../../../StoreModules';
import { projectId } from '../../../../../config';
import { isGenomicsProjectId } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';

export const ExpOrganismToggleID = 'exp-organism-toggle';

export interface ExperimentalOrganismProps {
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly setDatasetDetails: Consumer<PartialDatasetDetails>;
  readonly datasetMeta: PartialDatasetDetails;
  readonly jsonPath: JsonPathBuilder;
}

export function ExperimentalOrganism(
  props: ExperimentalOrganismProps
): ReactElement {
  const { hasExperimentalOrganism } = props.clientSideState;

  const setEnabled = (enabled: boolean) =>
    props.setClientSideState({
      ...props.clientSideState,
      hasExperimentalOrganism: enabled,
    });

  const safeExperimentalOrganism = props.datasetMeta.experimentalOrganism ?? {};

  const onChange = partialRight(
    changeHandler<PartialOrganism>,
    safeExperimentalOrganism,
    (org) =>
      props.setDatasetDetails({
        ...props.datasetMeta,
        experimentalOrganism: org,
      })
  );

  const isGenomics = isGenomicsProjectId(projectId);

  const required = !isGenomics
    ? hasExperimentalOrganism
    : props.datasetMeta.visibility === 'public' ||
      isNonBlankString(safeExperimentalOrganism.species) ||
      isNonBlankString(safeExperimentalOrganism.strain);

  const disabled = isGenomics ? undefined : !hasExperimentalOrganism;

  const disabledClass = disabled ? ' disabled-fields' : '';

  const isPublic = props.datasetMeta.visibility === 'public';

  return (
    <>
      <InputBlock header="Organism Details">
        <p className="section-description">
          Indicate the species and strain of each organism represented by
          biological data in this dataset. Organisms may include pathogens,
          vectors, symbionts, or other organisms represented directly or
          indirectly by the data..
          {isGenomics &&
            ' The organism species and strain may differ from the Reference Genome species and strain used for mapping or analysis.'}
        </p>

        <div className={'field-grid' + disabledClass}>
          {!isGenomics ? (
            <>
              <label
                className={'not-disabled' + (isPublic ? ' required' : '')}
                id={ExpOrganismToggleID}
              >
                Includes Biological Data about Organisms?
              </label>
              <YesNoToggle
                value={hasExperimentalOrganism}
                setValue={setEnabled}
                fieldName="enable-exp-organism"
                className="not-disabled"
                required={isPublic}
                disableRequiredStyling={true}
                helpText={
                  'Whether this dataset includes biological data describing one or more organisms.'
                }
              />
            </>
          ) : null}

          <InputPair
            label="Species"
            type="text"
            fieldName={props.jsonPath.appendToString<PartialOrganism>(
              'species'
            )}
            value={props.datasetMeta.experimentalOrganism?.species}
            onChange={onChange('species')}
            required={required}
            disabled={disabled}
            minLength={3}
            maxLength={128}
          />
          <FieldHelpText>
            Scientific name of the organism that was detected, measured,
            characterized, or otherwise represented in this dataset (e.g.,
            Plasmodium falciparum).
          </FieldHelpText>

          <InputPair
            label="Strain"
            type="text"
            fieldName={props.jsonPath.appendToString<PartialOrganism>('strain')}
            value={props.datasetMeta.experimentalOrganism?.strain}
            required={required}
            disabled={disabled}
            onChange={onChange('strain')}
            minLength={3}
            maxLength={128}
          />
          <FieldHelpText>
            The strain of the organism represented in this dataset. For
            field-collected organisms without a defined strain, enter "field
            isolates" or "field samples", as appropriate.
          </FieldHelpText>
        </div>
      </InputBlock>
    </>
  );
}
