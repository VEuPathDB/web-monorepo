import KeyCodes from './KeyCodes';

const idPrefix = 'listener_';

type ListenerSignature = [string, EventListener];

interface EventsInstance {
  listenerStore: (ListenerSignature | undefined)[];
  add: (eventName: string, callback: EventListener) => string;
  use: (map?: Record<string, EventListener>) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  onKey: (
    key: string,
    callback: (e: KeyboardEvent) => void
  ) => string | undefined;
  onKeyCode: (
    keyCodeOrSet: number | number[],
    callback: (e: KeyboardEvent) => void
  ) => string;
}

export const EventsFactory = (node: EventTarget): EventsInstance => {
  const instance: EventsInstance = {
    listenerStore: [],
    add: (eventName: string, callback: EventListener) => {
      eventName = eventName.toLowerCase();
      const signature: ListenerSignature = [eventName, callback];
      const length = instance.listenerStore.push(signature);
      node.addEventListener(eventName, callback);
      return idPrefix + (length - 1);
    },
    use: (map: Record<string, EventListener> = {}) => {
      Object.entries(map).forEach((entry) => instance.add(...entry));
    },
    remove: (id: string) => {
      const offset = idPrefix.length;
      const index = parseInt(id.substring(offset));
      const listener = instance.listenerStore[index];
      if (listener) {
        const [event, callback] = listener;
        node.removeEventListener(event, callback);
        delete instance.listenerStore[index];
      }
    },
    clearAll: () => {
      const clear = (listener: ListenerSignature | undefined, index: number) =>
        instance.remove(idPrefix + index);
      instance.listenerStore.forEach(clear);
    },
    onKey: (key: string, callback: (e: KeyboardEvent) => void) => {
      if (!(key in KeyCodes)) return;
      return instance.onKeyCode(
        KeyCodes[key as keyof typeof KeyCodes] as number | number[],
        callback
      );
    },
    onKeyCode: (
      keyCodeOrSet: number | number[],
      callback: (e: KeyboardEvent) => void
    ) => {
      const handler = (e: Event) => {
        const keyboardEvent = e as KeyboardEvent;
        const acceptable = Array.isArray(keyCodeOrSet)
          ? keyCodeOrSet
          : [keyCodeOrSet];
        if (acceptable.includes(keyboardEvent.keyCode)) callback(keyboardEvent);
      };
      return instance.add('keydown', handler);
    },
  };
  return instance;
};

const Events = EventsFactory(window);
export default Events;
