import { DataUpload, DataUploadType, newResultUpload, UploadFormConfig, UploadMethodConfig } from "../../FormTypes";
import { UrlParams } from "../../FormTypes/form-config";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";
import { ResultUploadConfig } from "../../../Utils/types";
import { transform } from "../../../Utils/utils";
import { ReactElement, useMemo, useState } from "react";
import { cx } from "../component-utils";
import { RadioList } from "@veupathdb/wdk-client/lib/Components";
import { toDataUploadType } from "../../Common/upload-method";
import { DataFileInput } from "./DataFileInput";
import { DataSourceURLInput } from "./DataSourceURLInput";
import { StrategyDataInput } from "./StrategyDataInput";

interface Props {
  readonly formConfig: UploadFormConfig;
  readonly urlParams: UrlParams;
  readonly strategyOptions: readonly StrategySummary[];
  readonly resultUploadConfig?: ResultUploadConfig;
}

export function UploadSection(props: Props): ReactElement {
  if (props.formConfig.uploadMethodConfigs.length === 1)
    return <div className={cx("--UploadMethodSelector")}>
      <div className={cx("--FixedUploadItem")}>
        {newUploadMethodOption(props.formConfig.uploadMethodConfigs[0]).display}
      </div>
    </div>;

  return InputRadioList(props)
}

function InputRadioList({
  formConfig,
  resultUploadConfig,
  strategyOptions,
  urlParams,
}: Props): ReactElement {
  const selectedUploadType = useMemo(
    () => computeInitialUploadState(
      formConfig,
      urlParams,
      strategyOptions,
      resultUploadConfig,
    ),
    [ formConfig, resultUploadConfig, strategyOptions, urlParams ],
  );

  const [ uploadType, setUploadType ] = useState(selectedUploadType?.kind ?? DataUploadType.SingleFile);

  return <RadioList
    name="data-set-radio"
    className={cx("--UploadMethodSelector")}
    value={uploadType}
    onChange={value => setUploadType(toDataUploadType(value))}
    items={formConfig.uploadMethodConfigs.map(newUploadMethodOption)}
  />;
}

function newUploadMethodOption(config: UploadMethodConfig) {
  switch (config.kind) {
    case DataUploadType.SingleFile:
      return {
        value: config.kind,
        display: DataFileInput(config),
      };
    case DataUploadType.URL:
      return {
        value: config.kind,
        display: DataSourceURLInput(config),
      };
    case DataUploadType.Result:
      return {
        value: config.kind,
        display: StrategyDataInput(config),
      };
    default:
      throw new Error(`illegal state: invalid upload type '${(config as UploadMethodConfig).kind}'`);
  }
}

function computeInitialUploadState(
  uploadConfig: UploadFormConfig,
  urlParams: UrlParams,
  strategyOptions: readonly StrategySummary[],
  resultUploadConfig?: ResultUploadConfig,
): DataUpload | undefined {
  // 1. Step
  if (urlParams.datasetStepId != null) {
    const stepId = Number(urlParams.datasetStepId);
    if (isFinite(stepId))
      return {
        kind: DataUploadType.Result,
        compatibleRecordTypes: resultUploadConfig?.compatibleRecordTypes ?? {},
        stepId,
      };
  }

  // 2. Strategy
  if (urlParams.datasetStrategyId) {
    const displayStrategyUpload = uploadConfig.uploadMethodConfigs
      .some(it => it.asKind(DataUploadType.Result)?.offerStrategyUpload === true);

    const enableStrategyUploadMethod = displayStrategyUpload && strategyOptions.length > 0;

    const strategyId = Number(urlParams.datasetStrategyId);

    if (enableStrategyUploadMethod && isFinite(strategyId)) {
      return transform(
        strategyOptions.find(it => it.strategyId === strategyId)?.rootStepId,
        it => it ? newResultUpload(it, resultUploadConfig?.compatibleRecordTypes ?? {}) : undefined,
      );
    }

    return transform(
      strategyOptions[0].rootStepId,
      it => it ? newResultUpload(it, resultUploadConfig?.compatibleRecordTypes ?? {}) : undefined,
    );
  }

  // 3. URL
  if (urlParams.datasetUrl) {
    const displayUrlUpload = uploadConfig.uploadMethodConfigs
      .some(it => it.asKind(DataUploadType.URL)?.offer === true);

    if (displayUrlUpload) {
      return {
        kind: DataUploadType.URL,
        url: urlParams.datasetUrl,
      };
    }
  }

  // 4. File (no initial state)
  return undefined;
}
