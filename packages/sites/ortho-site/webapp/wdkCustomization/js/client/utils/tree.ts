import { Decoder, record, string } from '@veupathdb/wdk-client/lib/Utils/Json';

export interface GroupTreeResponse {
  newick: string;
}

export const groupTreeResponseDecoder: Decoder<GroupTreeResponse> = record({
  newick: string,
});
