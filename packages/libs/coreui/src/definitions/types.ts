/**
 * A custom utility type that allows you to create Partial
 * like definitions, but handles nested objects.  */
export type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object ? Subset<K[attr]> : K[attr];
};
