import { ReactElement, useState } from "react";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { DatasetPublication, PublicationType } from "../../../Service/Types";
import { newListPropUpdater, RecordUpdater } from "../component-utils";
import { LabeledTextInput } from "../LabeledInput";
import { Checkbox } from "@veupathdb/coreui";

interface Props {
  readonly index: number;
  readonly publication: DatasetPublication;
  readonly updater: RecordUpdater<DatasetPublication>;
  readonly displayText: DisplayText["formDisplay"]["additionalInfo"]["recommended"]["publications"];
}

export function Publication({
  index,
  publication,
  displayText,
  updater,
}: Props): ReactElement {
  const updatePublication = newListPropUpdater(index, updater);

  const [ pmid, setPMID ] = useState(publication.type === "pmid" ? publication.identifier : undefined);
  const [ doi, setDOI ] = useState(publication.type === "doi" ? publication.identifier : undefined);
  const [ doubleID, setDoubleID ] = useState(false);

  const updateIdentifier = (value: string | undefined, kind: PublicationType) => {
    if (kind === "pmid") {
      setPMID(value);
    } else if (kind === "doi") {
      setDOI(value);
    }

    if (publication.type == null || (!pmid && !doi)) {
      // if no publication type has been set
      // OR both fields are currently blank
      updatePublication({
        identifier: value,
        type: kind,
      });
    } else if (publication.type === kind) {
      // If type already aligns with the value
      updatePublication("identifier", value);
    } else {
      // Else, type mismatch, wrong field has text
      setDoubleID(true);
      updatePublication({
        identifier: undefined,
        type: undefined,
      });
    }
  };

  return <div className={`dataset-publication record-${index}`}>
    <LabeledTextInput
      label={displayText.pubmedIdLabel}
      value={pmid}
      disabled={!!doi}
      className={"identifier pmid" + (doubleID ? " invalid" : undefined)}
      onChange={it => updateIdentifier(it, "pmid")}/>

    <span>&nbsp;OR&nbsp;</span>

    <LabeledTextInput
      label={displayText.doiLabel}
      value={doi}
      disabled={!!pmid}
      className={"identifier doi" + (doubleID ? " invalid" : undefined)}
      onChange={it => updateIdentifier(it, "doi")}/>

    <Checkbox
      className="is-primary"
      selected={publication.isPrimary === true}
      onToggle={it => updatePublication("isPrimary", it)} />
  </div>;
}
