import * as io from "io-ts";
import * as api from "../../Service/Types";

export type {
  DataInputConfigUnion,
  DatasetDependenciesConfig,
  DatasetUploadFormConfig,
  VariableFieldLabels,
} from "./form-config";

export const userDatasetFormContent = io.intersection([
  io.type({
    name: io.string,
    summary: io.string,
  }),
  io.partial({
    visibility: api.visibilityEnum,
    description: io.string,
    publications: io.array(api.publication),
    contacts: io.array(api.contact),
    projectName: io.string,
    programName: io.string,
    linkedDatasets: io.array(api.linkedDataset),
    experimentalOrganism: api.organism,
    hostOrganism: api.organism,
    characteristics: api.characteristics,
    externalIdentifiers: api.externalIdentifiers,
    funding: io.array(api.fundingAward),
    shortAttribution: io.string,
  }),
]);
export type UserDatasetFormContent = io.TypeOf<typeof userDatasetFormContent>;

