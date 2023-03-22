import React from 'react';
import {wrappable} from 'wdk-client/Utils/ComponentUtils';

function StrategyHelpPage() {
  return (
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/hmTzUUibSeY"
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen></iframe>
  );
}

export default wrappable(StrategyHelpPage)
