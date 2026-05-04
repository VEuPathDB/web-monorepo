import * as vdi from './model/response-decoders';

export class VdiRoute {
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
  static readonly VariablePropertiesPathSegment = '/variable-properties';

  // Full Static Paths
  static readonly UserShareOffersPath =
    VdiRoute.UserInfoPath + VdiRoute.SelfUserPathSegment + '/share-offers';
  static readonly UserMetadataPath =
    VdiRoute.UserInfoPath + VdiRoute.SelfUserPathSegment + '/meta';

  // region Service Path Construction

  static datasetUri(id: vdi.DatasetId) {
    return VdiRoute.DatasetListPath + `/${id}`;
  }

  static datasetFilesUri(id: vdi.DatasetId) {
    return VdiRoute.datasetUri(id) + VdiRoute.FilesPathSegment;
  }

  static datasetStaticFileUri(
    id: vdi.DatasetId,
    file: vdi.RootDatasetFile
  ) {
    return VdiRoute.datasetFilesUri(id) + `/${file}`;
  }

  static datasetDocumentFileUri(id: vdi.DatasetId, file: string) {
    return (
      VdiRoute.datasetFilesUri(id) +
      VdiRoute.DocumentsPathSegment +
      `/${file}`
    );
  }

  static datasetVariablePropertiesFileUri(
    id: vdi.DatasetId,
    file: string
  ) {
    return (
      VdiRoute.datasetFilesUri(id) +
      VdiRoute.VariablePropertiesPathSegment +
      `/${file}`
    );
  }

  static datasetShareUri(
    id: vdi.DatasetId,
    recipient: number,
    file: 'offer' | 'receipt'
  ) {
    return (
      VdiRoute.datasetUri(id) +
      VdiRoute.SharesPathSegment +
      '/' +
      recipient.toString() +
      '/' +
      file
    );
  }

  // endregion Service Path Construction
}
