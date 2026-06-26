import React, { ReactElement } from 'react';
import { FieldHelpText, InputBlock, InputPair, YesNoToggle } from '../../index';
import { partialRight } from 'lodash';
import { changeHandler, Consumer, JsonPathBuilder } from '../../../../../Utils';
import { PartialDatasetDetails } from '../../../../../Service';
import { PartialOrganism } from '../../../../../Service/Model/request-types';
import { ClientSideUploadFormState } from '../../../../../StoreModules';
import { isNonBlankString } from '../../../../../Utils/value-tests';
import { projectId } from '../../../../../config';

export const ExpOrganismToggleID = 'exp-organism-toggle';

export interface ExperimentalOrganismProps {
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly setDatasetDetails: Consumer<PartialDatasetDetails>;
  readonly datasetDetails: PartialDatasetDetails;
  readonly jsonPath: JsonPathBuilder;
}

export function ExperimentalOrganism(props: ExperimentalOrganismProps): ReactElement {
  const { hasExperimentalOrganism } = props.clientSideState;

  const disabledClass = hasExperimentalOrganism ? '' : ' disabled-fields';

  const setEnabled = (enabled: boolean) => props.setClientSideState({
    ...props.clientSideState,
    hasExperimentalOrganism: enabled,
  });

  const safeExperimentalOrganism = props.datasetDetails.experimentalOrganism ?? {};

  const onChange = partialRight(
    changeHandler<PartialOrganism>,
    safeExperimentalOrganism,
    org => props.setDatasetDetails({
      ...props.datasetDetails,
      experimentalOrganism: org,
    }),
  );

  const required = projectId === 'ClinEpiDB'
    ? hasExperimentalOrganism
    : isNonBlankString(safeExperimentalOrganism.species)
      || isNonBlankString(safeExperimentalOrganism.strain);

  const disabled = projectId === 'ClinEpiDB'
    ? !hasExperimentalOrganism
    : undefined;

  return (
    <>
      <InputBlock header="Experimental Organism" isCommunityRelated={true}>
        <p className="section-description">
          Indicate the species and strain of the organism that was used to
          generate data. The Experimental Organism may differ from the Reference
          Genome used for mapping or analysis and/or the Study Population
          Species from which samples or data were collected.
        </p>

        <div className={'field-grid' + disabledClass}>
          {
            projectId === 'ClinEpiDB'
              ? (
                <>
                  <label className="not-disabled" id={ExpOrganismToggleID}>
                    Available Experimental Organism?
                  </label>
                  <YesNoToggle
                    value={hasExperimentalOrganism}
                    setValue={setEnabled}
                    fieldName="enable-exp-organism"
                    className="not-disabled"
                    helpText={
                      'Whether this dataset includes laboratory data from specific organisms(s)' +
                      ', including organisms collected from study participants' +
                      ', animals, vectors, or environmental samples.'
                    }
                  />
                </>
              )
              : null
          }

          <InputPair
            label="Species"
            type="text"
            fieldName={props.jsonPath.appendToString<PartialOrganism>('species')}
            value={props.datasetDetails.experimentalOrganism?.species}
            onChange={onChange('species')}
            required={required}
            disabled={disabled}
            minLength={3}
            maxLength={128}
          />
          <FieldHelpText>
            Scientific name of the organism used to generate data (e.g.,
            Plasmodium falciparum).
          </FieldHelpText>

          <InputPair
            label="Strain"
            type="text"
            fieldName={props.jsonPath.appendToString<PartialOrganism>('strain')}
            value={props.datasetDetails.experimentalOrganism?.strain}
            required={required}
            disabled={disabled}
            onChange={onChange('strain')}
            minLength={3}
            maxLength={128}
          />
          <FieldHelpText>
            The strain of the organism used to generate data. For
            field-collected organisms without a defined strain, enter 'field
            isolate' or 'field sample'.
          </FieldHelpText>
        </div>
      </InputBlock>
    </>
  );
}
