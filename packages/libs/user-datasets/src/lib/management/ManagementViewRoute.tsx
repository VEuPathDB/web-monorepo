import { RouteComponentProps } from 'react-router-dom';
import { ManagementViewController } from './ManagementViewController';
import { ReactElement } from 'react';
import { useCurrentUser } from '../Hooks/global-state';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

export const ROUTES: ReadonlyArray<string> = [ '/:id', '/:id/edit' ];

type RouteParams = { readonly id: string; };

/**
 * Renders the dataset details page (`/:id`), with the edit modal open when the
 * URL ends in `/edit` (`/:id/edit`). Both URLs must reach this same component
 * so that opening the modal does not remount the page.
 */
export const ManageOrEditDatasetRoute = ({
  match: { params: { id: datasetId } }
}: RouteComponentProps<RouteParams>): ReactElement => {
  const user = useCurrentUser();

  if (user == null) {
    return <Loading />;
  }

  return (
    <ManagementViewController
      datasetId={datasetId}
      currentUser={user}
      showDatasetNameAttribute={true}
      showAllDatasetsLink={true}
    />
  );
}
