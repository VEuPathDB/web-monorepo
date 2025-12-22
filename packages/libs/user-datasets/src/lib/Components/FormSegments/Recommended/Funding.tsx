import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { DatasetFundingAward } from "../../../Service/Types";
import { RecordUpdater } from "../component-utils";
import { ReactElement } from "react";

interface Props {
  readonly index: number;
  readonly fundingAward: DatasetFundingAward;
  readonly updater: RecordUpdater<DatasetFundingAward>;
  readonly displayText: DisplayText;
}

export function FundingRow(props: Props): ReactElement {

}