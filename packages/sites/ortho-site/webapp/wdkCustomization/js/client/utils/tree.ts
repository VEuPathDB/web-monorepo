import { Decoder, record, string } from '@veupathdb/wdk-client/lib/Utils/Json';

export interface TreeResponse {
  newick: string;
}

export const treeResponseDecoder: Decoder<TreeResponse> = record({
  newick: string,
});
