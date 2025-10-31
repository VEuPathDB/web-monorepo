import * as React from "react";
import { IconAlt as Icon, Link } from "@veupathdb/wdk-client/lib/Components";
import { Tooltip } from "@veupathdb/coreui";

import { DatasetDetails, DatasetListEntry, InstallStatusEnum } from "../Service/Types";
import { VDIConfig } from "../Utils/types";

interface Props {
  readonly baseUrl: string;
  readonly userDataset: DatasetDetails | DatasetListEntry;
  readonly vdiConfig: VDIConfig,
  readonly projectId: string;
  readonly displayName: string;
  readonly linkToDataset: boolean;
  readonly useTooltip: boolean;
  readonly datasetNoun: string;
}

const orderedStatuses: InstallStatusEnum[] = [
  "failed-validation",
  "missing-dependency",
  "failed-installation",
  "ready-for-reinstall",
  "running",
  "complete",
];

/**
 * This is a mapping of import and install statuses received from VDI response
 *  import queued                 clock "queued"
 *  import in-progress	          clock "queued"
 *  import complete               clock "queued"
 *  import invalid			          yellow: "validation error on import; this is why"
 *  import failed 			          grey: "error on import (a bug); please let us know"
 *  install running		            clock: "in progress"
 *  install complete		          green: "complete"
 *  install failed-validation     yellow: "validation error on install; this is why"
 *  install failed-installation   grey: "error on install (a bug); pls let us know"
 *  install ready-for-reinstall   grey: "error on install (a bug); pls let us know"
 *  install missing-dependency    yellow: "incompatible, why"
 */
function getStatus(
  dataset: DatasetDetails | DatasetListEntry,
  reconcilerInterval: string,
  projectId: string,
  dataNoun: string,
  projectDisplayName: string,
): { content: React.ReactNode; icon: string } {
  const status = dataset.status;

  const isTargetingCurrentSite = dataset.installTargets.includes(projectId);

  if (!isTargetingCurrentSite) {
    return {
      content: `This ${dataNoun} was uploaded and installed in a different VEuPathDB project.`,
      icon: "minus-circle",
    };
  }

  const importStatus = status.import;

  switch (importStatus) {
    case "queued":
    case "in-progress":
      return {
        content: `This ${dataNoun} is queued. Please check again soon (reload the page).`,
        icon: "clock-o",
      };

    case "invalid":
      return {
        content: <>
          This {dataNoun} was rejected as invalid during the import phase
          {"importMessages" in dataset
            ? " " + (dataset as DatasetDetails).importMessages?.join(", ") + "."
            : "."
          }
        </>,
        icon: "exclamation-circle",
      };

    case "failed":
      return {
        content: (
          <>
            Failed during the import phase. If the problem persists, please let
            us know through our{" "}
            <Link to="/contact-us" target="_blank">support form</Link>.
          </>
        ),
        icon: "times-circle",
      };
  }

  if (importStatus !== "complete") {
    return {
      content: `This ${dataNoun} is queued. Please check again soon.`,
      icon: "clock-o",
    };
  }

  const installData = status.install?.find(d => d.installTarget === projectId);
  const metaStatus = installData?.metaStatus;
  const metaMessage = installData?.metaMessages?.join(", ") ?? "";
  const dataStatus = installData?.dataStatus;
  const dataMessage = installData?.dataMessages?.join(", ") ?? "";

  // Returns the "least" status between metaStatus and dataStatus
  const combinedStatus = orderedStatuses.find(
    status => metaStatus === status || dataStatus === status,
  );

  switch (combinedStatus) {
    case "running":
      return {
        content: "In progress. Please check again soon.",
        icon: "clock-o",
      };

    case "complete":
      return {
        content: `This ${dataNoun} is installed and ready to use in ${projectDisplayName}.`,
        icon: "check-circle",
      };

    case "failed-validation":
      return {
        content: (
          <>
            This {dataNoun} was rejected as invalid during the install phase:{" "}
            {metaMessage}
            {metaMessage.length && dataMessage.length ? "; " : ""}
            {dataMessage}
          </>
        ),
        icon: "exclamation-circle",
      };

    case "failed-installation":
      return {
        content: <>
          Failed during the install phase. If the problem persists, please
          let us know through our{" "}
          <Link to="/contact-us" target="_blank">support form</Link>
          .
        </>,
        icon: "times-circle",
      };

    case "ready-for-reinstall":
      return {
        content: <>
          This {dataNoun} will be reinstalled within {reconcilerInterval} hours.
          Please check again soon.
        </>,
        icon: "minus-circle",
      };

    case "missing-dependency":
      return {
        content: <>
          This {dataNoun} is incompatible: {metaMessage}
          {metaMessage.length && dataMessage.length ? "; " : ""}
          {dataMessage}
        </>,
        icon: "exclamation-circle",
      };

    default:
      return {
        content: "Status unknown at this time. Please check again soon.",
        icon: "clock-o",
      };
  }
}

export default function UserDatasetStatus(props: Props) {

  const { content, icon: faIcon } = getStatus(
    props.userDataset,
    props.vdiConfig.daemons.reconciler.fullRunInterval,
    props.projectId,
    props.datasetNoun.toLowerCase(),
    props.displayName,
  );

  const link = `${props.baseUrl}/${props.userDataset.datasetId}`;
  const children = <Icon className="StatusIcon" fa={faIcon}/>;

  if (props.useTooltip && props.linkToDataset) {
    return (
      <Tooltip title={content ?? ""}>
        <Link to={link}>{children}</Link>
      </Tooltip>
    );
  }

  if (props.useTooltip && !props.linkToDataset) {
    return <Tooltip title={content ?? ""}>{children}</Tooltip>;
  }

  if (!props.useTooltip && props.linkToDataset) {
    return (
      <Link to={link}>
        <React.Fragment>
          {children} {content}
        </React.Fragment>
      </Link>
    );
  }

  return (
    <React.Fragment>
      {children} {content}
    </React.Fragment>
  );
}
