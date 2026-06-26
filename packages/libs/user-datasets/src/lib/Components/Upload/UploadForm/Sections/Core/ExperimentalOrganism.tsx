import { ReactElement } from 'react';
import { projectId } from '../../../../../config';
import {
  FieldHelpText,
  InputBlock,
  InputPair,
  YesNoToggle,
} from '../../Components';
import { partialRight } from 'lodash';
import { changeHandler, Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetPostDetails } from '../../../../../Service';
import { PostOrganism } from '../../../../../Service/Model/request-types';
import { isNonBlankString } from '../../../../../Utils/value-tests';
import { ClientSideUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';

export const ExpOrganismToggleID = 'exp-organism-toggle';

export interface ExperimentalOrganismProps {
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly setDatasetDetails: Consumer<DatasetPostDetails>;
  readonly datasetDetails: DatasetPostDetails;
  readonly jsonPath: JsonPathBuilder;
}

//export function ExperimentalOrganism(props: ExperimentalOrganismProps): ReactElement {
export function ExperimentalOrganism({
  clientSideState,
  setClientSideState,
  jsonPath,
  datasetDetails,
  setDatasetDetails,
}: ExperimentalOrganismProps): ReactElement {
  const fieldName = jsonPath.appendToString<DatasetPostDetails>(
    'experimentalOrganism'
  );
  const { hasExpOrg } = clientSideState;
  const disabledClass = hasExpOrg ? '' : ' disabled-fields';
  const setEnabled = (enabled: boolean) =>
    setClientSideState({ ...clientSideState, hasExpOrg: enabled });

  const safeExperimentalOrganism = datasetDetails.experimentalOrganism ?? {};

  const onChange = partialRight(
    changeHandler<PostOrganism>,
    safeExperimentalOrganism,
    (org) => setDatasetDetails({ ...datasetDetails, experimentalOrganism: org })
  );

  const required = isNonBlankString(safeExperimentalOrganism.species)
    || isNonBlankString(safeExperimentalOrganism.strain);

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
          { projectId === 'ClinEpiDB' ? (
            <>
              <label className="not-disabled" id={ExpOrganismToggleID}>
                Available Experimental Organism?
              </label>
              <YesNoToggle
                value={hasExpOrg}
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
          ) : null}

          <InputPair
            label="Species"
            type="text"
            fieldName={jsonPath.appendToString<PostOrganism>('species')}
            value={datasetDetails.experimentalOrganism?.species}
            required={projectId === 'ClinEpiDB' ? hasExpOrg : required}
            disabled={projectId === 'ClinEpiDB' ? !hasExpOrg : undefined}
            onChange={onChange('species')}
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
            fieldName={jsonPath.appendToString<PostOrganism>('strain')}
            value={datasetDetails.experimentalOrganism?.strain}
            required={projectId === 'ClinEpiDB' ? hasExpOrg : required}
            disabled={projectId === 'ClinEpiDB' ? !hasExpOrg :undefined}
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
