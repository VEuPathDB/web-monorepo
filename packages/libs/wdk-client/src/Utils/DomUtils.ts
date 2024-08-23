export function findAncestorNode(
  targetNode: Node | null,
  predicate: (node: Node) => boolean,
  rootNode: Node = document.documentElement
): Node | undefined {
  while (targetNode != null && targetNode != rootNode) {
    if (predicate(targetNode)) return targetNode;
    targetNode = targetNode.parentNode;
  }
  return undefined;
}

/**
 * Check if a targetNode has an ancestor node that satisfies a predicate function.
 */
export function containsAncestorNode(
  targetNode: Node | null,
  predicate: (node: Node) => boolean,
  rootNode: Node = document.documentElement
): boolean {
  const ancestorNode = findAncestorNode(targetNode, predicate, rootNode);
  return ancestorNode != null;
}

/**
 * Is the top of the element visible in the element's scroll parent?
 * @param element
 */
export function isElementInViewport(element: HTMLElement) {
  const scrollParent = findScrollParent(element);
  return (
    scrollParent != null &&
    // top of element above top of scroll parent
    (scrollParent.scrollTop > element.offsetTop ||
      // bottom of element below bottom of scroll parent
      scrollParent.scrollTop + scrollParent.clientHeight <=
        element.offsetTop + element.clientHeight)
  );
}

export function scrollIntoView(element: HTMLElement) {
  findScrollParent(element).scrollTop = element.offsetTop;
}

export function findScrollParent(element: HTMLElement) {
  const scrollParentNode = findAncestorNode(element, (node) => {
    if (!(node instanceof HTMLElement)) return false;
    const { overflowY } = window.getComputedStyle(node);
    const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
    return isScrollable && node.scrollHeight >= node.clientHeight;
  });
  return scrollParentNode instanceof HTMLElement
    ? scrollParentNode
    : document.documentElement;
}

/**
 * Scroll element into view, if needed. Only scrolls offsetParent.
 * @param element Element to scroll into view
 */
export function scrollIntoViewIfNeeded(element: HTMLElement) {
  if (isElementInViewport(element)) scrollIntoView(element);
}

export function copyContent(node: HTMLElement) {
  try {
    const selection = window.getSelection();
    if (selection == null) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  } catch (error) {
    console.error(error);
  }
}

export function writeTextToClipboard(str: string) {
  return navigator?.clipboard?.writeText == null
    ? writeText(str)
    : navigator.clipboard.writeText(str);
}

// TypeScript adaptation of
// https://gist.github.com/lgarron/d1dee380f4ed9d825ca7#gistcomment-2934251
// A minimal polyfill for `navigator.clipboard.writeText()` that works most of the time in most modern browsers.
// Note that on Edge this may call `resolve()` even if    copying failed.
// See https://github.com/lgarron/clipboard-polyfill for a more robust solution.
// License: public domain
function writeText(str: string): Promise<void> {
  return new Promise(function (resolve, reject) {
    const range = document.createRange();
    range.selectNodeContents(document.body);
    document.getSelection()?.addRange(range);

    let success = false;
    function listener(e: ClipboardEvent) {
      e.clipboardData?.setData('text/plain', str);
      e.preventDefault();
      success = true;
    }
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);

    document.getSelection()?.removeAllRanges();

    success ? resolve() : reject();
  });
}

/**
 * Strip HTML characters from a string.
 */
export function stripHTML(str: string): string {
  let span = document.createElement('span');
  span.innerHTML = str;
  return span.textContent || '';
}
