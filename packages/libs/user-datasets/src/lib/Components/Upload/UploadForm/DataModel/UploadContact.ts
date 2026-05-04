import { DatasetContact } from "../../../../Service/model/response-decoders";

export type UploadContact = Partial<DatasetContact> & {
  readonly firstAuthor?: boolean;
};