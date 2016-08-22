/**
 * Basic get/set utils for persisting data. This simply uses localStorage. No
 * caching is involved. The main benefit of these tools is that is prepends
 * keys in a uniform way, and it handles string/js conversion.
 */

const prefix = '@@eupathdb';

export function set(key, value) {
  try {
    window.localStorage.setItem(
      prefix + '/' + key,
      JSON.stringify({ value })
    );
  }
  catch(e) {
    rethrow("Unable to set value to localStorage.", e);
  }
}

export function get(key, defaultValue) {
  try {
    let entry = JSON.parse(window.localStorage.getItem(prefix + '/' + key));
    return entry == null ? defaultValue : entry.value;
  }
  catch(e) {
    rethrow("Unable to get value from localStorage.", e);
  }
}

function rethrow(prefix, error) {
  e.message = prefix + " " + e.message;
  throw e;
}
