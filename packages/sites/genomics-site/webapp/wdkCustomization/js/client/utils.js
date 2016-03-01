// Test a node to see if its content is overflowwing
export function isNodeOverflowing(node) {
  return node.clientWidth !== node.scrollWidth;
}

/**
 * Calculate the offsetLeft and offsetTop for `element` such that it is visble
 * within the viewport, relative to another element. The positions are absolute,
 * and above and to the right of `aroundElement` is preferred.
 *
 * If `aroundElement` is null, `element` will be centered.
 *
 * @param {HTMLElement} element
 * @param {HTMLElement?} aroundElement
 * @return { offsetTop: number; offsetLeft: number; }
 */
export function getBestPosition(element, aroundElement = null) {
  let elementRectangle = element.getBoundingClientRect();
  console.log('elementRectangle', elementRectangle);
  let containerRectangle = {
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight
  };

  let centerLeft = (containerRectangle.left + (containerRectangle.width / 2)) - (elementRectangle.width / 2);
  let centerTop = (containerRectangle.top + (containerRectangle.height / 2)) - (elementRectangle.height / 2);

  if (aroundElement != null) {
    let aroundRectangle = aroundElement.getBoundingClientRect();
    console.log('aroundRectangle', aroundRectangle);
    let goRight = containerRectangle.right - aroundRectangle.right > elementRectangle.width;
    let goLeft = !goRight && aroundRectangle.left - containerRectangle.left > elementRectangle.width;
    let goUp = aroundRectangle.top - containerRectangle.top > elementRectangle.height;
    let goDown = !goUp && containerRectangle.bottom - aroundRectangle.bottom > elementRectangle.height;

    let offsetLeft = goRight ? aroundRectangle.right
             : goLeft ? aroundRectangle.left - elementRectangle.width
             : centerLeft;

    let offsetTop = goDown ? aroundRectangle.bottom
            : goUp ? aroundRectangle.top - elementRectangle.height
            : centerTop;

    return { offsetLeft, offsetTop };
  }

  return { top: centerTop, left: centerLeft };
}
