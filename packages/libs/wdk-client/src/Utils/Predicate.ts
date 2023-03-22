type Predicate = (...args: any[]) => boolean;
/**
 * Mixin that is added to the predicate function
 */
let PredicateMixin = {

  or(this: Predicate, test: Predicate) {
    return predicate((...args: any[]) => this(...args) || test(...args));
  },

  and(this: Predicate, test: Predicate) {
    return predicate((...args: any[]) => this(...args) && test(...args));
  }

};

/**
 * Create a chainable function that wraps `test`.
 */
export default function predicate(test: Predicate) {
  return Object.assign((...args: any[]) => test(...args), PredicateMixin);
}
