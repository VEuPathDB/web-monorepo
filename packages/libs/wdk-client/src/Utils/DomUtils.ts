import { flow } from 'lodash';
import { preorder } from 'wdk-client/Utils/TreeUtils';
import { find } from 'wdk-client/Utils/IterableUtils';

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
 * Track scroll position of `element` and if height or width of `element`
 * changes, scroll to tracked position.
 */
export const addScrollAnchor = addScrollAnchor__loop

/*
 * Loop-based algorithm for scroll anchoring.
 *
 * This requires a little more work by the browser since it is a continuous
 * loop, but it allows all logic to be performed in the same callback function
 * which mitigates the potential for race conditions.
 */
function addScrollAnchor__loop(
  container: HTMLElement,
  anchorNode = findAnchorNode(container)
) {
  let { scrollY } = window;
  let containerRect = container.getBoundingClientRect();
  const offsetParent = container.offsetParent || document.body;
  let parentSize = offsetParent.clientHeight;
  let animId: number;

  function loop() {
    animId = requestAnimationFrame(function() {
      loop();
      if (parentSizeChanged() || containerHasResized()) {
        scrollToAnchor();
      }
      else if (pageHasScrolled()) {
        updateAnchor();
      }
      scrollY = window.scrollY;
      containerRect = container.getBoundingClientRect();
      parentSize = offsetParent.clientHeight;
    });
  }

  function pageHasScrolled(): boolean {
    return scrollY !== window.scrollY;
  }

  function updateAnchor() {
    anchorNode = findAnchorNode(container);
    console.debug('updating anchorNode', anchorNode);
  }

  function parentSizeChanged(): boolean {
    return parentSize !== offsetParent.clientHeight;
  }

  function containerHasResized(): boolean {
    const newContainerRect = container.getBoundingClientRect();
    const heightDiff = Math.abs(containerRect.height - newContainerRect.height);
    const widthDiff = Math.abs(containerRect.width - newContainerRect.width);
    if (heightDiff > 10 || widthDiff > 10) {
      console.debug({ heightDiff, widthDiff });
      return true;
    }
    return false;
  }

  function scrollToAnchor() {
    if (anchorNode != null) {
      anchorNode.scrollIntoView();
      console.debug('scrolling to anchorNode', anchorNode);
    }
  }

  // start loop
  loop();

  return function cancel() {
    cancelAnimationFrame(animId);
  }
}


/**
 * Event-based algorithm for scroll anchoring.
 */
function addScrollAnchor__events(element: Element, anchorNode = findAnchorNode(element)) {
  let anchorNodeRect = anchorNode && anchorNode.getBoundingClientRect();
  let scrollingToAnchor = false;

  console.debug(Date.now(), 'updated anchorNode', anchorNode);

  function scrollHandler() {
    if (scrollingToAnchor) return;

    anchorNode = findAnchorNode(element);
    anchorNodeRect = anchorNode && anchorNode.getBoundingClientRect();
    console.debug(Date.now(), 'updated anchorNode', anchorNode);
  }

  function rectHandler() {
    if (anchorNode == null || anchorNodeRect == null) return;

    scrollingToAnchor = true;
    anchorNode.scrollIntoView();
    window.scrollBy(0, (anchorNodeRect.top * -1) + 1);
    console.debug(Date.now(), 'scrolled to anchorNode', anchorNode);
    setTimeout(() => { scrollingToAnchor = false });
  }

  // return composite cancellation function
  return flow(
    monitorRectChange(element, ['height', 'width'], rectHandler),
    monitorScroll(scrollHandler)
  );
}

/**
 * When properties of the client rectangle of `element` change, invoke callback.
 */
function monitorRectChange(element: Element, trackedProps: Array<keyof ClientRect>, callback: () => void) {
  // FIXME Don't monitor while user is scrolling
  let rect = element.getBoundingClientRect();
  let rafId: number;

  checkWidth();

  return function cancel() {
    cancelAnimationFrame(rafId);
  }

  function checkWidth() {
    rafId = requestAnimationFrame(function() {
      checkWidth();
      let newRect = element.getBoundingClientRect();
      if (trackedProps.some(prop => rect[prop] !== newRect[prop])) {
        callback();
      }
      rect = newRect;
    });
  }
}

/**
 * Invoke callback when window scroll event is fired.
 */
function monitorScroll(scrollHandler: () => void) {
  window.addEventListener('scroll', scrollHandler);
  return function cancel() {
    window.removeEventListener('scroll', scrollHandler);
  }
}

/**
 * Find first descendent of `element` that is within viewport.
 */
function findAnchorNode(element: Element) {
  // skip if element is below top of viewport
  if (element.getBoundingClientRect().top > 0) return;

  return find(
    (node: Element) => node.getBoundingClientRect().top > 0,
    preorder(element, getElementChildren)
  );
}

function getElementChildren(el: Element) {
  return Array.from(el.children);
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
    ((scrollParent.scrollTop > element.offsetTop) ||
    // bottom of element below bottom of scroll parent
    ((scrollParent.scrollTop + scrollParent.clientHeight) <= (element.offsetTop + element.clientHeight)))
  );
}

export function scrollIntoView(element: HTMLElement) {
  findScrollParent(element).scrollTop = element.offsetTop;
}

export function findScrollParent(element: HTMLElement) {
  const scrollParentNode = findAncestorNode(
    element,
    node => {
      if (!(node instanceof HTMLElement)) return false;
      const { overflowY } = window.getComputedStyle(node);
      const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
      return isScrollable && node.scrollHeight >= node.clientHeight;
    }
  );
  return scrollParentNode instanceof HTMLElement ? scrollParentNode : document.documentElement;
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
  }
  catch (error) {
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
// Note that on Edge this may call `resolve()` even if copying failed.
// See https://github.com/lgarron/clipboard-polyfill for a more robust solution.
// License: public domain
function writeText(str: string): Promise<void> {
  return new Promise(function(resolve, reject) {

    const range = document.createRange();
    range.selectNodeContents(document.body);
    document.getSelection()?.addRange(range);

    let success = false;
    function listener(e: ClipboardEvent) {
      e.clipboardData?.setData("text/plain", str);
      e.preventDefault();
      success = true;
    }
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);

    document.getSelection()?.removeAllRanges();

    success ? resolve(): reject();
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
