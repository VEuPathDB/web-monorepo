import KeyCodes from './KeyCodes';
const idPrefix = 'listener_';

export const EventsFactory = (node) => {
  const instance = {
    listenerStore: [],
    add: (eventName, callback) => {
      eventName = eventName.toLowerCase();
      let signature = [eventName, callback];
      let length = instance.listenerStore.push(signature);
      node.addEventListener(eventName, callback);
      return idPrefix + --length;
    },
    use: (map = {}) => {
      Object.entries(map).forEach((entry) => instance.add(...entry));
    },
    remove: (id) => {
      const offset = idPrefix.length;
      let index = parseInt(id.substring(offset));
      let [event, callback] = instance.listenerStore[index];
      node.removeEventListener(event, callback);
      delete instance.listenerStore[index];
    },
    clearAll: () => {
      const clear = (listener, index) => instance.remove(idPrefix + index);
      instance.listenerStore.forEach(clear);
    },
    onKey: (key, callback) => {
      if (!key in KeyCodes) return;
      return instance.onKeyCode(KeyCodes[key], callback);
    },
    onKeyCode: (keyCodeOrSet, callback) => {
      let handler = (e) => {
        let acceptable = Array.isArray(keyCodeOrSet)
          ? keyCodeOrSet
          : [keyCodeOrSet];
        if (acceptable.includes(e.keyCode)) callback(e);
      };
      return instance.add('keydown', handler);
    },
  };
  return instance;
};

const Events = EventsFactory(window);
export default Events;
