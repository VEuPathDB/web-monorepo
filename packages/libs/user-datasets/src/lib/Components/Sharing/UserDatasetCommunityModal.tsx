import React from "react";

import { IconAlt as Icon, Loading } from "@veupathdb/wdk-client/lib/Components";
import { Modal } from "@veupathdb/coreui";
import { FilledButton } from "@veupathdb/coreui";

import "../UserDatasets.scss";
import "./UserDatasetSharingModal.scss";
import { User } from "@veupathdb/wdk-client/lib/Utils/WdkUser";
import { DatasetListEntry } from "../../Service/Types";
import { ShareContext } from "../../Utils/types";
import { VariableDisplayText } from "../FormTypes";


const isAre = (total: number) => total === 1 ? "is" : "are";

interface Props {
  readonly user: User;
  readonly datasets: DatasetListEntry[];
  readonly onClose: () => void;
  readonly context: ShareContext;
  readonly displayText: VariableDisplayText;
  readonly updateDatasetCommunityVisibility: (
    datasetIds: string[],
    isVisibleToCommunity: boolean,
    context: ShareContext,
  ) => any;
  readonly updatePending: boolean;
  readonly updateSuccessful: boolean;
  readonly updateError: string | undefined;
}

export default function UserDatasetSharingModal(props: Props) {
  const {
    datasets,
    onClose,
    displayText,
    updateDatasetCommunityVisibility,
    updateSuccessful,
    updateError,
    context,
    updatePending,
    user,
  } = props;

  const totalSelectedDatasets = datasets.length;

  const totalOwnedDatasets = datasets.filter(dataset => dataset && dataset.owner === user.id).length;

  const totalCommunityDatasets = datasets.filter(dataset => dataset.visibility === "public").length;

  const totalNotOwnedDatasets = totalSelectedDatasets - totalOwnedDatasets;

  const targetNoun = totalSelectedDatasets === 1
    ? displayText.datasetNounSingular
    : displayText.datasetNounPlural;
  const targetNounLower = targetNoun.toLowerCase();

  const datasetNoun = (totalSelectedDatasets === 1 ? "this " : "these ") + targetNounLower;

  const CloseButton = () => (
    <button className="btn" onClick={onClose}>
      Close this window.
    </button>
  );

  const content = updatePending
    ? <Loading/>
    : updateError
      ? (
        <div className="UserDataset-SharingModal-StatusView">
          <Icon fa="times-circle danger"/>
          <h2>Error Sharing {targetNoun}.</h2>
          <p>
            An error occurred while sharing your {targetNounLower}. Please try
            again.
          </p>
          <CloseButton/>
        </div>
      )
      : updateSuccessful
        ? (
          <div className="UserDataset-SharingModal-StatusView">
            <Icon fa="check-circle success"/>
            <h2>Community access updated successfully.</h2>
            <CloseButton/>
          </div>
        )
        : (
          <div className="UserDataset-SharingModal-FormView">
            <div className="UserDataset-SharingModal-VisibilitySection">
              <p className="UserDataset-SharingModal-Subtitle">
                <em>
                  Community {displayText.datasetNounPlural} can be viewed and downloaded by all
                  users.
                </em>
              </p>
              <div>
                <p>
                  {totalSelectedDatasets} selected ({totalCommunityDatasets}{" "}
                  {isAre(totalCommunityDatasets)} already in Community{" "}
                  {displayText.datasetNounPlural}{" "}
                  {totalNotOwnedDatasets > 0
                    ? `; ${totalNotOwnedDatasets} ${isAre(
                      totalNotOwnedDatasets,
                    )} owned by someone else`
                    : ""}
                  ).
                </p>
                <p>
                  <strong>
                    {totalOwnedDatasets > 0
                      ? `Change Community access for ${totalOwnedDatasets} selected ${targetNounLower} that you own:`
                      : `You do not own any of the selected datsets.`}
                  </strong>
                </p>
                <FilledButton
                  disabled={totalOwnedDatasets === 0}
                  themeRole="primary"
                  styleOverrides={{
                    container: {
                      margin: "1em 0",
                    },
                  }}
                  text={`Grant access to ${totalOwnedDatasets} ${targetNounLower}`}
                  onPress={() =>
                    updateDatasetCommunityVisibility(
                      datasets.map(d => d.datasetId),
                      true,
                      context,
                    )
                  }
                />
                <FilledButton
                  disabled={totalOwnedDatasets === 0}
                  themeRole="primary"
                  styleOverrides={{
                    container: {
                      margin: "1em 0",
                    },
                  }}
                  text={`Revoke access to ${totalOwnedDatasets} ${targetNounLower}`}
                  onPress={() =>
                    updateDatasetCommunityVisibility(
                      datasets.map(d => d.datasetId),
                      false,
                      context,
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

  return (
    <Modal
      title={`Manage Community Access to ${datasetNoun}`}
      themeRole="primary"
      includeCloseButton
      toggleVisible={onClose}
      visible
      titleSize="small"
    >
      <div className="UserDataset-SharingModal">{content}</div>
    </Modal>
  );
}
