export default UserDatasetSharingModal;
declare class UserDatasetSharingModal extends React.Component<any, any, any> {
  constructor(props: any);
  state: {
    recipients: never[];
    recipientInput: null;
    processing: boolean;
    succeeded: null;
  };
  renderShareItem(share: any, index: any, userDataset: any): JSX.Element;
  renderShareList({ userDataset }: { userDataset: any }): JSX.Element[] | null;
  renderDatasetList({ datasets }: { datasets: any }): JSX.Element[] | null;
  renderDatasetItem(userDataset: any): JSX.Element;
  renderRecipientItem(recipient: any, index: any): JSX.Element;
  renderRecipientList({
    recipients,
  }: {
    recipients: any;
  }): JSX.Element | JSX.Element[];
  renderRecipientForm(): JSX.Element;
  handleTextChange(recipientInput?: null): void;
  handleRecipientAdd(): void;
  isMyDataset(dataset: any): any;
  verifyRecipient(recipientEmail: any): Promise<void>;
  removeRecipient(recipient: any): any;
  getDatasetNoun(): string;
  disqualifyRecipient(recipientEmail: any, reason: any): void;
  submitShare(): void;
  renderEmptyState(): JSX.Element;
  unshareWithUser(datasetId: any, userId: any): void;
  isRecipientValid(recipient?: {}): any;
  renderViewContent(): JSX.Element;
  isDatasetShareable(dataset?: {}): boolean;
  getValidRecipients(): never[];
  getShareableDatasets(): any;
  renderSharingButtons(): JSX.Element;
  acceptRecipient(recipientEmail: any, id: any): void;
  unselectDataset(dataset: any): void;
  render(): JSX.Element;
}
declare namespace UserDatasetSharingModal {
  export { WdkDependenciesContext as contextType };
}
import React from 'react';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
//# sourceMappingURL=UserDatasetSharingModal.d.ts.map
