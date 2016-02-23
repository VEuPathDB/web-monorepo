// Test a node to see if its content is overflowwing
export function isNodeOverflowing(node) {
  return node.clientWidth !== node.scrollWidth;
}
