import React, { Dispatch, ReactElement, SetStateAction } from "react";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";
import { FieldLabel } from "../FieldLabel";
import { SingleSelect } from "@veupathdb/wdk-client/lib/Components";
import { cx } from "../component-utils";

interface Props {
  readonly stepId: number;
  readonly setStepId: Dispatch<SetStateAction<number>>;
  readonly strategyOptions: StrategySummary[];
}

export function StrategyDataInput({ stepId, setStepId, strategyOptions }: Props): ReactElement {
  return <>
    <FieldLabel htmlFor="data-set-strategy">Upload Strategy</FieldLabel>
    <div id="data-set-strategy" className={cx("--UploadMethodField")}>
      <SingleSelect
        value={`${stepId}`}
        items={strategyOptions.map((option) => (
          {
            value: `${option.rootStepId}`,
            display: `${option.name}${!option.isSaved ? "*" : ""}`,
          }))}
        onChange={(value) => {
          setStepId(Number(value));
        }}
      />
    </div>
  </>;
}
