import { DatasetStatusInfo, DatasetUploadStatusInfo } from '../Model';
import {
  DatasetImportStatusInfo,
  DatasetInstallStatusEntry,
} from '../Model/response-decoders';
import { ifDefined } from '../../Utils';

export class DatasetStatus {
  readonly installTarget: string;
  readonly uploadStatus: Readonly<DatasetUploadStatusInfo>;
  readonly importStatus: Readonly<DatasetImportStatusInfo> | null;
  readonly metaInstallStatus: Readonly<DatasetInstallStatusEntry> | null;
  readonly dataInstallStatus: Readonly<DatasetInstallStatusEntry> | null;

  constructor(status: DatasetStatusInfo, installTarget: string) {
    this.uploadStatus = status.upload;
    this.importStatus = status['import'] ?? null;

    this.installTarget = installTarget;

    const installStatus = status.install?.find(it => it.installTarget === installTarget);

    this.metaInstallStatus = installStatus?.meta ?? null;
    this.dataInstallStatus = installStatus?.data ?? null;
  }

  get isUploaded(): boolean {
    return this.uploadStatus.status === 'success';
  }

  get isUploadInProgress(): boolean {
    return this.uploadStatus.status === 'running';
  }

  get isImported(): boolean {
    return this.importStatus?.status === 'complete';
  }

  get isImportInProgress(): boolean {
    return ifDefined(this.importStatus?.status, it => it === 'in-progress' || it === 'queued')
      ?? false;
  }

  get isMetaInstalled(): boolean {
    return this.metaInstallStatus?.status === 'complete';
  }

  get isMetaInstallInProgress(): boolean {
    return this.metaInstallStatus?.status === 'running';
  }

  get isDataInstalled(): boolean {
    return this.dataInstallStatus?.status === 'complete';
  }

  get isDataInstallInProgress(): boolean {
    return this.dataInstallStatus?.status === 'running';
  }

  get isFullyInstalled(): boolean {
    return this.isMetaInstalled && this.isDataInstalled;
  }

  get isInProgress(): boolean {
    return this.isUploadInProgress
      || this.isImportInProgress
      || this.isMetaInstallInProgress
      || this.isDataInstallInProgress;
  }

  get isFailedForBug(): boolean {
    return this.uploadStatus.status === 'failed'
      || this.importStatus?.status === 'failed'
      || this.metaInstallStatus?.status === 'failed-installation'
      || this.dataInstallStatus?.status === 'failed-installation';
  }

  get isFailedForBadUserInput(): boolean {
    return this.uploadStatus.status === 'rejected'
      || this.importStatus?.status === 'invalid'
      || this.metaInstallStatus?.status === 'failed-validation'
      || this.metaInstallStatus?.status === 'missing-dependency'
      || this.dataInstallStatus?.status === 'failed-validation'
      || this.dataInstallStatus?.status === 'missing-dependency';
  }

  get isAwaitingReinstall(): boolean {
    return this.metaInstallStatus?.status === 'ready-for-reinstall'
    || this.dataInstallStatus?.status === 'ready-for-reinstall';
  }

  get isFailed(): boolean {
    return this.isFailedForBadUserInput || this.isFailedForBug;
  }
}
