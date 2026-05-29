import { DatasetId } from './Model';
import { RootDatasetFile } from './Model/utility-types';

export class VdiRoutes {
  // Root API Paths
  static readonly DatasetListPath = '/datasets';
  static readonly PluginsPath = '/plugins';
  static readonly ServiceInfoPath = '/service-meta';
  static readonly UserInfoPath = '/users';

  // Subpath segments
  static readonly CommunityPathSegment = '/community';
  static readonly DocumentsPathSegment = '/documents';
  static readonly FilesPathSegment = '/files';
  static readonly SelfUserPathSegment = '/self';
  static readonly SharesPathSegment = '/shares';
  static readonly VariablePropertiesPathSegment = '/dataset-properties';

  // Full Static Paths
  static readonly UserShareOffersPath =
    VdiRoutes.UserInfoPath + VdiRoutes.SelfUserPathSegment + '/share-offers';
  static readonly UserMetadataPath =
    VdiRoutes.UserInfoPath + VdiRoutes.SelfUserPathSegment + '/meta';

  // region Service Path Construction

  static datasetUri(id: DatasetId) {
    return VdiRoutes.DatasetListPath + `/${id}`;
  }

  static datasetFilesUri(id: DatasetId) {
    return VdiRoutes.datasetUri(id) + VdiRoutes.FilesPathSegment;
  }

  static datasetStaticFileUri(id: DatasetId, file: RootDatasetFile) {
    return VdiRoutes.datasetFilesUri(id) + `/${file}`;
  }

  static datasetDocumentFileUri(id: DatasetId, file: string) {
    return (
      VdiRoutes.datasetFilesUri(id) +
      VdiRoutes.DocumentsPathSegment +
      `/${file}`
    );
  }

  static datasetPropertiesFileUri(id: DatasetId, file: string) {
    return (
      VdiRoutes.datasetFilesUri(id) +
      VdiRoutes.VariablePropertiesPathSegment +
      `/${file}`
    );
  }

  static datasetShareUri(
    id: DatasetId,
    recipient: number,
    file: 'offer' | 'receipt'
  ) {
    return (
      VdiRoutes.datasetUri(id) +
      VdiRoutes.SharesPathSegment +
      '/' +
      recipient.toString() +
      '/' +
      file
    );
  }

  // endregion Service Path Construction
}
