import { Link } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  baseUrl: string;
  hasDirectUpload: boolean;
}

function NoDatasetsMessage({ baseUrl, hasDirectUpload }: Props) {
  return (
    <div className="UserDataset-NoDatasets">
      <div className="UserDataset-NoDatasets__lead">
        You do not have any data sets.
      </div>
      <ul>
        {hasDirectUpload ? (
          <li>
            Try adding a data set using the{' '}
            <Link to={`${baseUrl}/new`}>New upload</Link> section above.
          </li>
        ) : (
          <li>
            To add a data set, go to{' '}
            <a href="https://veupathdb.globusgenomics.org">VEuPathDB Galaxy</a>.
          </li>
        )}
        <li>
          For an overview of the functionality, see the{' '}
          <Link to={`${baseUrl}/help`}>Help</Link> section.
        </li>
      </ul>
    </div>
  );
}

export default NoDatasetsMessage;
