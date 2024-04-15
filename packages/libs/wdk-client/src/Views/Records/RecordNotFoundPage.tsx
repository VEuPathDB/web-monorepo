import { useLocation } from 'react-router';
import './RecordNotFound.css';

type Props = {
  sourceID: string;
};

export function RecordNotFoundPage({ sourceID }: Props) {
  const location = useLocation();
  const searchUrl = window.location.href.replace(
    location.pathname,
    `/search?q=${sourceID}`
  );
  return (
    <div>
      <h1 className="wdk-RecordNotFoundHeader">
        No results for <strong>{sourceID}</strong>
      </h1>
      <p className="wdk-RecordNotFoundParagraph">
        The ID may have changed. Please use our site search feature to find
        matches for{' '}
        <a href={searchUrl}>
          <strong>{sourceID}</strong>
        </a>
        .
      </p>
    </div>
  );
}
