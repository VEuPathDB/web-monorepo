import React, { ReactElement } from 'react';
import { FieldHelpText, InputBlock, InputPair } from '../../index';
import { partialRight } from 'lodash';
import { changeHandler, Consumer, JsonPathBuilder } from '../../../../../Utils';
import { PartialDatasetDetails } from '../../../../../Service';
import { PartialOrganism } from '../../../../../Service/Model/request-types';
import { isNonBlankString } from '../../../../../Utils/value-tests';

export interface ExperimentalOrganismProps {
  readonly setDatasetDetails: Consumer<PartialDatasetDetails>;
  readonly datasetDetails: PartialDatasetDetails;
  readonly jsonPath: JsonPathBuilder;
}

export function ExperimentalOrganism(props: ExperimentalOrganismProps): ReactElement {
  const safeExperimentalOrganism = props.datasetDetails.experimentalOrganism ?? {};

  const onChange = partialRight(
    changeHandler<PartialOrganism>,
    safeExperimentalOrganism,
    org => props.setDatasetDetails({ ...props.datasetDetails, experimentalOrganism: org })
  );

  const required = isNonBlankString(safeExperimentalOrganism.species)
    || isNonBlankString(safeExperimentalOrganism.strain)
    || props.datasetDetails.visibility === 'public';

  return (
    <>
      <InputBlock header="Experimental Organism" isCommunityRelated={true}>
        <p className="section-description">
          Indicate the species and strain of the organism that was used to
          generate data. The Experimental Organism may differ from the Reference
          Genome used for mapping or analysis.
        </p>

        <div className="field-grid">
          <InputPair
            label="Species"
            type="text"
            fieldName={props.jsonPath.appendToString<PartialOrganism>('species')}
            value={props.datasetDetails.experimentalOrganism?.species}
            onChange={onChange('species')}
            required={required}
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
            onChange={onChange('strain')}
            minLength={3}
            maxLength={128}
          />
          <FieldHelpText>
            The strain of the organism used to generate data.
          </FieldHelpText>
        </div>
      </InputBlock>
    </>
  );
}