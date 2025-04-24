import { useLocation } from 'react-router';
import './RecordNotFound.css';

type Props = {
  sourceID: string;
};

export function RecordNotFoundPage({ sourceID }: Props) {
  const location = useLocation();
  const searchUrl = window.location.href
    .replace(location.pathname, `/search?q=${sourceID}`)
    .replace(window.location.search, '');
  return (
    <div className="wdk-RecordNotFoundParagraph">
      <p>
        <strong>{sourceID}</strong> is not a current identifier.
      </p>
      <p>References to this identifier may exist in other records.</p>
      <p>
        <a href={searchUrl}>
          <i className="fa fa-search"></i> Search our site for{' '}
          <strong>{sourceID}</strong>
        </a>
      </p>
    </div>
  );
}
