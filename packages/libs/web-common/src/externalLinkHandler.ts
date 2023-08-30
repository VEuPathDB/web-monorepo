import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { rootElement } from './config';
/**
 * This module adds a mutation observer that will add a target="_blank"
 * attribute to anchor elements with a href for an external site.
 */
// addEventListener('DOMContentLoaded', function execute() {
//   const target = document.querySelector(rootElement);
//   if (window.MutationObserver == null || target == null) return;

//   const observer = new MutationObserver(function callback(mutations, observer) {
//     Seq.from(mutations)
//       .map(mutation => mutation.target)
//       .filter((node): node is HTMLElement => node instanceof HTMLElement)
//       .flatMap(node => node.querySelectorAll('a'))
//       .filter(a => !!a.href && !a.target)
//       .forEach(a => {
//         const url = new URL(a.href);
//         if (url.origin !== location.origin) {
//           a.target = "_blank";
//           a.rel = "noreferrer";
//         }
//       });
//   });
//   observer.observe(target, {
//     subtree: true,
//     childList: true,
//   });
// });

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
    if (url.origin !== location.origin) {
      event.target.target = '_blank';
      event.target.rel = 'noreffer';
    }
  }
});
