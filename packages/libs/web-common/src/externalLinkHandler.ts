import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { rootElement } from './config';

/**
 * Add click event listener to add target and rel for external links
 */
addEventListener('click', (event) => {
  if (
    event.target instanceof HTMLAnchorElement &&
    event.target.href &&
    !event.target.target
  ) {
    const url = new URL(event.target.href);
    if (url.origin !== location.origin || !event.target.target) {
      event.target.target = '_blank';
      event.target.rel = 'noreffer';
    }
  }
});
