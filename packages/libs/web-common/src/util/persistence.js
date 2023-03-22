/**
 * Basic get/set utils for persisting data. This simply uses localStorage. No
 * caching is involved. The main benefit of these tools is that is prepends
 * keys in a uniform way, and it handles string/js conversion.
 */

const store = window.localStorage;
const prefix = '@@ebrc@@';

/**
 * Set the value for the key in the store
 */
export function set(key, value) {
  try {
    store.setItem(prefix + '/' + key, JSON.stringify(value));
  }
  catch(e) {
    console.error("Unable to set value to localStorage.", e);
  }
}

/**
 * Get the value for the key from the store
 */
export function get(key, defaultValue) {
  try {
    let item = store.getItem(prefix + '/' + key);
    return item == null ? defaultValue : JSON.parse(item);
  }
  catch(e) {
    console.error("Unable to get value from localStorage.", e);
    return defaultValue;
  }
}
