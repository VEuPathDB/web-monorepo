import { ReactElement } from "react";
import { RadioList } from "@veupathdb/wdk-client/lib/Components";
import { Consumer, transform } from "../../../Utils/utils";
import { initDatasetVisibilities } from "../../global-config";
import { DatasetVisibility } from "../../../Service/Types";

interface VisibilityProps {
  readonly fieldName: string;
  readonly value: DatasetVisibility | undefined;
  readonly onChange: Consumer<DatasetVisibility | undefined>;
  readonly enabledVisibilities: DatasetVisibility[];
}

export function VisibilityRadio(props: VisibilityProps): ReactElement {
  const items = transform(
    initDatasetVisibilities(),
    index => (Object.keys(index) as DatasetVisibility[])
      .filter(opt => props.enabledVisibilities.find(vis => opt === vis))
      .map(opt => ({ ...index[opt], description: index[opt].description() }))
  );

  const onChange = (v: string) => props.onChange(v as DatasetVisibility);

  return <div className="datasetVisibility">
    <label>Data accessibility</label>
    <RadioList items={items} onChange={onChange} name={props.fieldName} value={props.value}/>
  </div>;
}
