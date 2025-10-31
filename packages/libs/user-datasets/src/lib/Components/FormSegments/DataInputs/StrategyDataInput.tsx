import React, { ReactElement, useEffect, useMemo } from "react";
import { FieldLabel } from "../FieldLabel";
import { SingleSelect } from "@veupathdb/wdk-client/lib/Components";
import { cx } from "../component-utils";
import { ResultUploadConfig } from "../../FormTypes/form-config";
import { keyBy } from "lodash";
import { DataUploadType, newResultUpload } from "../../FormTypes";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";

export function StrategyDataInput({
  label,
  urlParams,
  strategyOptions,
  compatibleRecordTypes,
  fieldState: [ upload, setUpload ],
}: ResultUploadConfig): ReactElement {

  const strategyOptionsByStrategyId = useMemo(
    () => keyBy(strategyOptions, (option) => option.strategyId),
    [ strategyOptions ],
  );

  const initialStepId = useMemo(
    () => {
      const parsedStepIdParam = Number(urlParams.datasetStepId);

      if (isFinite(parsedStepIdParam)) {
        return parsedStepIdParam;
      }

      const parsedStrategyIdParam = Number(urlParams.datasetStrategyId);

      return !isFinite(parsedStrategyIdParam)
        ? strategyOptions[0]?.rootStepId
        : strategyOptionsByStrategyId[parsedStrategyIdParam]?.rootStepId;
    },
    [
      urlParams.datasetStepId,
      urlParams.datasetStrategyId,
      strategyOptions,
      strategyOptionsByStrategyId,
    ],
  );

  const strategyToSelectItem = (it: StrategySummary) => ({
    value: `${it.rootStepId}`,
    display: `${it.name}${!it.isSaved ? "*" : ""}`,
  })

  useEffect(
    () => setUpload(newResultUpload(initialStepId, compatibleRecordTypes)),
    [ compatibleRecordTypes, initialStepId, setUpload ],
  );

  return <>
    <FieldLabel htmlFor="data-set-strategy">{label}</FieldLabel>
    <div id="data-set-strategy" className={cx("--UploadMethodField")}>
      <SingleSelect
        value={upload?.kind === DataUploadType.Result
          ? upload.stepId.toString()
          : undefined}
        items={strategyOptions.map(strategyToSelectItem)}
        onChange={it => setUpload(newResultUpload(parseInt(it), compatibleRecordTypes))}
      />
    </div>
  </>;
}
